/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface AttioPersonData {
  email: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  companyDomain?: string;
}

interface AttioDealData {
  name: string;
  stage: string;
  value?: number;
  currency?: string;
  personRecordId?: string;
  companyRecordId?: string;
  source?: string;
  sekwencjaApollo?: string;
  stripeSubscriptionId?: string;
}

@Injectable()
export class AttioService {
  private readonly logger = new Logger(AttioService.name);
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.attio.com/v2";

  // Default deal owner (Rafal Reiwer — only workspace member)
  private readonly DEFAULT_OWNER_ID = "416b7599-41ee-4253-9c26-407638d53a32";

  // Pipeline stage IDs from Attio (discovered via MCP audit)
  private readonly STAGES = {
    outreach: "02ceec60-0ed1-4aa3-9b49-5ff54bd8b915",
    rejestracja: "e475cc9c-b270-41ab-90bd-beac3c47d9f2",
    ai_sourcing: "32adbc09-4a57-430d-9087-b72b150ad120",
    feedback: "fbcd610f-fbcb-4007-87d0-12615defd76d",
    platnosc: "a0e06f24-4c87-454d-a619-8f8c2891309a",
    won: "0fca3370-98e9-48e4-8258-90aa602dbc2f",
    lost: "bff46c8a-5671-4b7f-b46a-c7a3247385a8",
  };

  get isEnabled(): boolean {
    return !!this.apiKey;
  }

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("ATTIO_API_KEY") || "";
    if (!this.apiKey) {
      this.logger.warn(
        "ATTIO_API_KEY not configured — Attio integration disabled",
      );
    } else {
      this.logger.log("Attio service initialized");
    }
  }

  private async request(
    method: string,
    path: string,
    body?: any,
    params?: Record<string, string>,
  ): Promise<any> {
    if (!this.apiKey) {
      this.logger.warn(`Attio disabled, skipping ${method} ${path}`);
      return null;
    }

    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const url = `${this.baseUrl}${path}${qs}`;
    this.logger.log(`Attio API → ${method} ${path}${qs}`);

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(
        `Attio API FAILED: ${res.status} ${method} ${path}${qs}\n` +
          `  Request: ${JSON.stringify(body).substring(0, 500)}\n` +
          `  Response: ${text.substring(0, 500)}`,
      );
      return null;
    }

    return res.json();
  }

  /**
   * Find or create a Person in Attio by email.
   * Uses upsert (matching_attribute: email_addresses).
   */
  async upsertPerson(data: AttioPersonData): Promise<string | null> {
    const result = await this.request(
      "PUT",
      "/objects/people/records",
      {
        data: {
          values: {
            email_addresses: [{ email_address: data.email }],
            name: [
              {
                full_name: [data.firstName, data.lastName].filter(Boolean).join(" ") || data.email.split("@")[0],
                first_name: data.firstName || "",
                last_name: data.lastName || "",
              },
            ],
            ...(data.jobTitle && { job_title: [{ value: data.jobTitle }] }),
          },
        },
      },
      { matching_attribute: "email_addresses" },
    );

    const recordId = result?.data?.id?.record_id;
    if (recordId) {
      this.logger.log(`Attio person upserted: ${data.email} → ${recordId}`);
    }
    return recordId || null;
  }

  /**
   * Find or create a Company in Attio by domain.
   */
  async upsertCompany(name: string, domain?: string): Promise<string | null> {
    const values: any = {
      name: [{ value: name }],
    };
    if (domain) {
      values.domains = [{ domain }];
    }

    const result = await this.request(
      "PUT",
      "/objects/companies/records",
      { data: { values } },
      domain ? { matching_attribute: "domains" } : undefined,
    );

    const recordId = result?.data?.id?.record_id;
    if (recordId) {
      this.logger.log(`Attio company upserted: ${name} → ${recordId}`);
    }
    return recordId || null;
  }

  /**
   * Create a new Deal in Attio.
   */
  async createDeal(data: AttioDealData): Promise<string | null> {
    const stageId = this.STAGES[data.stage] || this.STAGES.outreach;

    const values: any = {
      name: [{ value: data.name }],
      stage: [{ status: stageId }],
      owner: [
        {
          referenced_actor_type: "workspace-member",
          referenced_actor_id: this.DEFAULT_OWNER_ID,
        },
      ],
    };

    if (data.value) {
      values.value = [
        { currency_value: data.value, currency_code: data.currency || "USD" },
      ];
    }
    if (data.personRecordId) {
      values.associated_people = [
        { target_object: "people", target_record_id: data.personRecordId },
      ];
    }
    if (data.companyRecordId) {
      values.associated_company = [
        { target_object: "companies", target_record_id: data.companyRecordId },
      ];
    }
    if (data.sekwencjaApollo) {
      values.sekwencja_apollo = [{ value: data.sekwencjaApollo }];
    }
    if (data.stripeSubscriptionId) {
      values.stripe_subscription_id = [{ value: data.stripeSubscriptionId }];
    }

    const result = await this.request("POST", "/objects/deals/records", {
      data: { values },
    });

    const recordId = result?.data?.id?.record_id;
    if (recordId) {
      this.logger.log(
        `Attio deal created: ${data.name} (${data.stage}) → ${recordId}`,
      );
    }
    return recordId || null;
  }

  /**
   * Update a deal's stage (and optionally other fields).
   */
  async updateDealStage(
    dealRecordId: string,
    stage: string,
    extraValues?: Record<string, any>,
  ): Promise<boolean> {
    const stageId = this.STAGES[stage];
    if (!stageId) {
      this.logger.error(`Unknown stage: ${stage}`);
      return false;
    }

    const values: any = {
      stage: [{ status: stageId }],
      ...extraValues,
    };

    const result = await this.request(
      "PATCH",
      `/objects/deals/records/${dealRecordId}`,
      {
        data: { values },
      },
    );

    if (result) {
      this.logger.log(`Attio deal ${dealRecordId} → stage: ${stage}`);
    }
    return !!result;
  }

  /**
   * Add a note to a record (person or deal).
   */
  async addNote(
    parentRecordId: string,
    parentObjectSlug: string,
    title: string,
    content: string,
  ): Promise<boolean> {
    const result = await this.request("POST", "/notes", {
      data: {
        parent_object: parentObjectSlug,
        parent_record_id: parentRecordId,
        title,
        content_plaintext: content,
      },
    });

    if (result) {
      this.logger.log(
        `Attio note added to ${parentObjectSlug}/${parentRecordId}: ${title}`,
      );
    }
    return !!result;
  }

  /**
   * Find deals by person email.
   * Searches deals with associated person matching the email.
   */
  async findDealsByEmail(
    email: string,
  ): Promise<Array<{ recordId: string; name: string; stage: string }>> {
    // First find the person
    const searchResult = await this.request(
      "POST",
      "/objects/people/records/query",
      {
        filter: {
          email_addresses: { contains: email },
        },
      },
    );

    const personId = searchResult?.data?.[0]?.id?.record_id;
    if (!personId) return [];

    // Then find deals associated with this person
    const dealsResult = await this.request(
      "POST",
      "/objects/deals/records/query",
      {
        filter: {
          associated_people: { contains: personId },
        },
      },
    );

    return (dealsResult?.data || []).map((d: any) => ({
      recordId: d.id.record_id,
      name: d.values?.name?.[0]?.value || "Unknown",
      stage: d.values?.stage?.[0]?.status?.title || "Unknown",
    }));
  }

  getStageId(stage: string): string | undefined {
    return this.STAGES[stage];
  }
}
