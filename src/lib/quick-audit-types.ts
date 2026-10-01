export interface AuditFinding {
  label: string;
  status: "pass" | "warning" | "unknown";
  detail: string;
}
export interface AuditSource {
  kind: "website" | "instagram";
  url: string;
  available: boolean;
  summary: string;
  findings: AuditFinding[];
}
export interface QuickAuditReport {
  checkedAt: string;
  sources: AuditSource[];
  limitations: string[];
}
