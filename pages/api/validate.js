import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { zone, password } = req.body;

  if (!zone || !password) {
    return res.status(400).json({ error: "Zone and password are required" });
  }

  // Define the expected zone keys (use 'trade' instead of 'chill')
  const validZones = ["food", "conference", "trade"];
  if (!validZones.includes(zone)) {
    return res.status(400).json({ error: "Invalid zone specified" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("event-pass-db"); // Explicitly specify the database name

    // Add debugging to log the query parameters
    console.log(
      `Attempting to find document with zone: ${zone}, password: ${password}`
    );

    // Query the collection for a matching zone and password
    // Using the collection name 'doctors' as specified by the user
    const credential = await db.collection("doctors").findOne({
      zone: zone,
      password: password,
    });

    // Log whether a matching document was found
    console.log(`Document found: ${credential ? "Yes" : "No"}`);
    if (credential) {
      console.log("Found document:", JSON.stringify(credential, null, 2));
    }

    if (credential) {
      // Password is correct, return data based on the zone
      if (zone === "food") {
        // Ensure the 'details' object and its properties exist
        if (
          credential.details &&
          credential.details.registrationNumber &&
          credential.details.doctorName
        ) {
          return res.status(200).json({
            type: "food",
            details: {
              registrationNumber: credential.details.registrationNumber,
              doctorName: credential.details.doctorName,
            },
          });
        } else {
          console.error(`Incomplete data for food zone, password: ${password}`);
          return res.status(500).json({
            error: "Server error: Incomplete data found for food zone.",
          });
        }
      } else if (zone === "trade") {
        // Ensure the 'details' object and its properties exist
        if (
          credential.details &&
          credential.details.doctorName &&
          credential.details.mobile &&
          credential.details.place &&
          credential.details.email
        ) {
          return res.status(200).json({
            type: "trade",
            details: {
              doctorName: credential.details.doctorName,
              mobile: credential.details.mobile,
              place: credential.details.place,
              email: credential.details.email,
            },
          });
        } else {
          console.error(
            `Incomplete data for trade zone, password: ${password}`
          );
          return res.status(500).json({
            error: "Server error: Incomplete data found for trade zone.",
          });
        }
      } else if (zone === "conference") {
        // For conference, we just need to confirm a valid password exists.
        // The URL is static and points to the public file.
        return res.status(200).json({
          type: "conference",
          url: "/Program Agenda.pdf", // Static URL to the PDF
        });
      }
    } else {
      // Invalid password or zone/password combination not found
      return res.status(401).json({ error: "Invalid password." });
    }
  } catch (error) {
    console.error("Database query failed:", error);
    // Provide more detailed error information for debugging
    const errorMessage = error.message || "Unknown error";
    console.error("Error details:", errorMessage);

    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? errorMessage : undefined,
    });
  }
}
