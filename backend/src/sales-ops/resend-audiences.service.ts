import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class ResendAudiencesService {
  private readonly logger = new Logger(ResendAudiencesService.name);
  private resend: Resend | null = null;

  // Segment IDs are set after first create/list call
  private segmentPl: string | null = null;
  private segmentEn: string | null = null;

  get isEnabled(): boolean {
    return !!this.resend;
  }

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log("Resend Audiences service initialized");
    } else {
      this.logger.warn("RESEND_API_KEY missing — Audiences disabled");
    }
  }

  /**
   * Ensure PL and EN segments exist, cache their IDs.
   */
  async ensureSegments(): Promise<void> {
    if (!this.resend) return;
    if (this.segmentPl && this.segmentEn) return;

    try {
      const { data } = await this.resend.audiences.list();
      const segments = data?.data || [];

      for (const seg of segments) {
        if (seg.name === "Procurea PL") this.segmentPl = seg.id;
        if (seg.name === "Procurea EN") this.segmentEn = seg.id;
      }

      if (!this.segmentPl) {
        const res = await this.resend.audiences.create({ name: "Procurea PL" });
        this.segmentPl = res.data?.id || null;
        this.logger.log(`Created Resend segment "Procurea PL": ${this.segmentPl}`);
      }
      if (!this.segmentEn) {
        const res = await this.resend.audiences.create({ name: "Procurea EN" });
        this.segmentEn = res.data?.id || null;
        this.logger.log(`Created Resend segment "Procurea EN": ${this.segmentEn}`);
      }
    } catch (e) {
      this.logger.error(`Failed to ensure segments: ${e.message}`);
    }
  }

  /**
   * Add a contact to the appropriate segment (PL or EN).
   */
  async addContact(params: {
    email: string;
    firstName?: string;
    lastName?: string;
    language: string;
  }): Promise<boolean> {
    if (!this.resend) return false;

    await this.ensureSegments();
    const segmentId = params.language === "pl" ? this.segmentPl : this.segmentEn;
    if (!segmentId) {
      this.logger.error(`No segment ID for language: ${params.language}`);
      return false;
    }

    try {
      // Create contact (Resend deduplicates by email automatically)
      const contactRes = await this.resend.contacts.create({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
      });

      const contactId = contactRes.data?.id;
      if (!contactId) {
        this.logger.error(`Failed to create contact: ${params.email}`);
        return false;
      }

      // Add to segment
      await this.resend.contacts.segments.add({
        contactId,
        segmentId,
      });

      this.logger.log(
        `Resend: ${params.email} → segment ${params.language === "pl" ? "PL" : "EN"}`,
      );
      return true;
    } catch (e) {
      this.logger.error(`Resend contact error (${params.email}): ${e.message}`);
      return false;
    }
  }

  /**
   * Bulk sync contacts from a list of users.
   */
  async syncAll(
    users: Array<{
      email: string;
      name?: string | null;
      language: string;
    }>,
  ): Promise<{ ok: number; failed: number }> {
    let ok = 0;
    let failed = 0;

    for (const user of users) {
      const nameParts = (user.name ?? "").split(" ");
      const success = await this.addContact({
        email: user.email,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.slice(1).join(" ") || undefined,
        language: user.language,
      });
      if (success) ok++;
      else failed++;
    }

    return { ok, failed };
  }
}
