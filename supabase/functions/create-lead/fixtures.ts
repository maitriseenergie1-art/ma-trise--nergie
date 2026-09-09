// Synthetic data only; these fixtures must never contain real prospect information.
export const contactPayload = {
  submissionId: "ba761c0c-c16f-40cb-a2d7-2c15361efdb9",
  sourceForm: "contact",
  trackingId: "lead_b3_synthetic",
  contact: {
    firstName: "Test",
    lastName: "B3",
    email: "b3@example.test",
    phone: "+33 6 00 00 00 00",
    companyName: "B3 Test",
  },
  need: { projectType: "Étude", equipment: [], message: "Test technique B3" },
  acquisition: { landingPage: "/", ctaSource: "b3_test", utmSource: "b3" },
  consent: { accepted: true, policyVersion: "test-v1" },
  website: "",
};
