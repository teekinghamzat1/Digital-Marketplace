// @ts-nocheck
import "dotenv/config";
import { prisma } from "./prisma";

async function main() {
  console.log("Seeding marketplace data...");

  const data = [
    {
      category: "Texting Apps",
      products: [
        {
          name: "TextPlus (Microsoft Login)",
          tiers: [
            { label: "1", quantity: 1, price: 1800 },
            { label: "5", quantity: 5, price: 7500 },
            { label: "10", quantity: 10, price: 12000 },
            { label: "50", quantity: 50, price: 50000 },
          ],
        },
        {
          name: "TextPlus (Gmail Login)",
          tiers: [
            { label: "1", quantity: 1, price: 2000 },
            { label: "5", quantity: 5, price: 8500 },
            { label: "10", quantity: 10, price: 15000 },
            { label: "50", quantity: 50, price: 60000 },
          ],
        },
        {
          name: "Talkatone (Gmail Login)",
          tiers: [
            { label: "1", quantity: 1, price: 2000 },
            { label: "5", quantity: 5, price: 8500 },
            { label: "10", quantity: 10, price: 15000 },
            { label: "50", quantity: 50, price: 60000 },
          ],
        },
        {
          name: "TextNow (Email Login)",
          tiers: [
            { label: "1", quantity: 1, price: 2000 },
            { label: "5", quantity: 5, price: 8500 },
            { label: "10", quantity: 10, price: 15000 },
            { label: "50", quantity: 50, price: 60000 },
          ],
        },
        {
          name: "Google Voice (Old)",
          tiers: [
            { label: "1", quantity: 1, price: 8000 },
            { label: "5", quantity: 5, price: 35000 },
            { label: "10", quantity: 10, price: 65000 },
            { label: "50", quantity: 50, price: 300000 },
          ],
        },
        {
          name: "Google Voice (New)",
          tiers: [
            { label: "1", quantity: 1, price: 6000 },
            { label: "5", quantity: 5, price: 27500 },
            { label: "10", quantity: 10, price: 50000 },
            { label: "50", quantity: 50, price: 250000 },
          ],
        },
      ],
    },
    {
      category: "Gmail Accounts (USA)",
      products: [
        {
          name: "Gmail (3–10 Years Old)",
          tiers: [
            { label: "1", quantity: 1, price: 2000 },
            { label: "5", quantity: 5, price: 8500 },
            { label: "10", quantity: 10, price: 15000 },
            { label: "50", quantity: 50, price: 60000 },
          ],
        },
        {
          name: "Gmail (6 Months – 1 Year)",
          tiers: [
            { label: "1", quantity: 1, price: 1500 },
            { label: "5", quantity: 5, price: 6500 },
            { label: "10", quantity: 10, price: 12000 },
            { label: "50", quantity: 50, price: 50000 },
          ],
        },
        {
          name: "Gmail (1–7 Days Old)",
          tiers: [
            { label: "1", quantity: 1, price: 1200 },
            { label: "5", quantity: 5, price: 5500 },
            { label: "10", quantity: 10, price: 10000 },
            { label: "50", quantity: 50, price: 45000 },
          ],
        },
      ],
    },
    {
      category: "VPN Services",
      products: [
        "ExpressVPN",
        "HMA VPN",
        "PIA VPN",
        "NordVPN",
        "Proton VPN",
        "Surfshark",
        "Avast SecureLine VPN",
      ].map((vpn) => ({
        name: vpn,
        tiers: [
          { label: "1", quantity: 1, price: 2000 },
          { label: "2", quantity: 2, price: 3800 },
          { label: "5", quantity: 5, price: 9000 },
        ],
      })),
    },
    {
      category: "Facebook Accounts",
      products: [
        {
          name: "HQI USA Facebook (3–10 Years Old)",
          tiers: [
            { label: "1", quantity: 1, price: 15000 },
            { label: "2", quantity: 2, price: 28000 },
            { label: "3", quantity: 3, price: 39000 },
            { label: "5", quantity: 5, price: 60000 },
          ],
        },
        {
          name: "HQ Old Random Facebook",
          tiers: [
            { label: "1", quantity: 1, price: 12000 },
            { label: "2", quantity: 2, price: 22000 },
            { label: "3", quantity: 3, price: 30000 },
            { label: "5", quantity: 5, price: 45000 },
          ],
        },
        {
          name: "New Facebook Account",
          tiers: [
            { label: "1", quantity: 1, price: 3000 },
            { label: "2", quantity: 2, price: 5600 },
            { label: "3", quantity: 3, price: 7500 },
            { label: "5", quantity: 5, price: 10000 },
          ],
        },
      ],
    },
    {
      category: "TikTok Accounts",
      products: [
        {
          name: "TikTok (800–1000 Followers)",
          tiers: [
            { label: "1", quantity: 1, price: 15000 },
            { label: "2", quantity: 2, price: 28000 },
            { label: "3", quantity: 3, price: 39000 },
            { label: "5", quantity: 5, price: 60000 },
          ],
        },
        {
          name: "TikTok (200–300 Followers)",
          tiers: [
            { label: "1", quantity: 1, price: 10000 },
            { label: "2", quantity: 2, price: 18000 },
            { label: "3", quantity: 3, price: 24000 },
            { label: "5", quantity: 5, price: 35000 },
          ],
        },
      ],
    },
  ];

  for (const catData of data) {
    const category = await prisma.category.create({
      data: {
        name: catData.category,
      },
    });

    for (const prodData of catData.products) {
      const product = await prisma.product.create({
        data: {
          name: prodData.name,
          categoryId: category.id,
          isActive: true,
        },
      });

      for (const [index, tierData] of prodData.tiers.entries()) {
        let badgeText = null;
        let highlightType = null;
        let savingsText = null;

        // Add some sample highlights
        if (index === 1) {
          badgeText = "Most Popular";
          highlightType = "most_purchased";
        } else if (index === 2) {
          badgeText = "Best Value";
          highlightType = "best_value";
          savingsText = "Save 15%";
        } else if (index === 3) {
          badgeText = "Hot Deal";
          highlightType = "hottest";
          savingsText = "Better deal than smaller package";
        }

        await prisma.tier.create({
          data: {
            productId: product.id,
            label: tierData.label,
            quantity: tierData.quantity,
            price: tierData.price,
            badgeText,
            highlightType,
            savingsText,
          },
        });
      }
    }
  }

  // Seed default settings
  console.log("Seeding default site settings...");
  const defaultSettings = [
    { key: "siteName", value: "Sumon Digital" },
    { key: "siteLogo", value: "/logo.png" },
    { key: "primaryColor", value: "#f97316" },
    { key: "secondaryColor", value: "#fb923c" },
    { key: "footerContact", value: "Digital Plaza, 4th Floor, Tech City" },
    { key: "email", value: "contact@sumondigital.com" },
    { key: "whatsapp", value: "+1234567890" },
    { key: "telegram", value: "https://t.me/sumondigital" },
    { key: "footerCopyright", value: "© 2026 Sumon Digital. All rights reserved." },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  // Seed legal pages
  console.log("Seeding default legal pages...");
  const legalPages = [
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: "<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we handle your data.</p>",
    },
    {
      slug: "terms-and-conditions",
      title: "Terms and Conditions",
      content: "<h1>Terms and Conditions</h1><p>By using our service, you agree to these terms.</p>",
    },
  ];

  for (const page of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, content: page.content },
      create: page,
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
