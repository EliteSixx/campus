import type { DemoOffer } from "./types";

export const demoOffers: DemoOffer[] = [
  {
    offer_id: "OFFER-ACME-ST001", student_id: "ST001", application_id: "APP-ST001-JOB001",
    company: "Acme Tech", role: "Backend Developer", ctc_lpa: 8.0, joining_date: "2027-07-01",
    document_checklist: [
      { document_id: "DOC-IDENTITY", label: "Government photo ID", required: true, status: "VERIFIED" },
      { document_id: "DOC-TRANSCRIPT", label: "Final semester transcript", required: true, status: "PENDING" },
      { document_id: "DOC-DEGREE", label: "Degree certificate or provisional certificate", required: true, status: "PENDING" },
      { document_id: "DOC-BANK", label: "Bank account proof", required: true, status: "PENDING" },
      { document_id: "DOC-PHOTO", label: "Passport-size photograph", required: false, status: "SUBMITTED" },
    ],
  },
];
