import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface ApolloContact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  organization?: { domain?: string };
  emailer_campaign_ids?: string[];
}

export interface ApolloCampaign {
  id: string;
  name: string;
  active: boolean;
  num_steps: number;
  unique_replied: number;
}

@Injectable()
export class ApolloApiService {
  private readonly logger = new Logger(ApolloApiService.name);
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.apollo.io/api/v1";

  get isEnabled(): boolean {
    return !!this.apiKey;
  }

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("APOLLO_API_KEY") || "";
    if (!this.apiKey) {
      this.logger.warn(
        "APOLLO_API_KEY not configured — Apollo polling disabled",
      );
    } else {
      this.logger.log("Apollo API service initialized");
    }
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    if (!this.apiKey) return null;

    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(
        `Apollo API error: ${res.status} ${method} ${path} — ${text}`,
      );
      return null;
    }

    return res.json();
  }

  /**
   * Get active email campaigns (sequences).
   */
  async getActiveCampaigns(): Promise<ApolloCampaign[]> {
    const result = await this.request("POST", "/emailer_campaigns/search", {
      per_page: 50,
      sort_by_key: "campaign_last_activity",
      sort_ascending: false,
    });

    if (!result?.emailer_campaigns) return [];

    return (result.emailer_campaigns as any[])
      .filter((c: any) => c.active)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        active: c.active,
        num_steps: c.num_steps || 0,
        unique_replied: c.unique_replied || 0,
      }));
  }

  /**
   * Search for contacts who replied to a specific campaign.
   * Returns contacts with "Replied" status in the given campaign.
   */
  async getRepliedContacts(
    campaignId: string,
  ): Promise<ApolloContact[]> {
    const result = await this.request("POST", "/contacts/search", {
      emailer_campaign_ids: [campaignId],
      contact_statuses: ["replied"],
      per_page: 100,
    });

    if (!result?.contacts) return [];

    return (result.contacts as any[]).map((c: any) => ({
      id: c.id,
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      organization_name: c.organization_name,
      organization: c.organization
        ? { domain: c.organization.domain }
        : undefined,
      emailer_campaign_ids: c.emailer_campaign_ids,
    }));
  }
}
