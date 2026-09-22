import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ======================================================
// Supabase Admin Client
// ======================================================

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not configured");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
);

// ======================================================
// Function startup
// ======================================================

console.log("clever-handler: START");

// ======================================================
// Edge Function
// ======================================================

Deno.serve(async (req) => {
  console.log("clever-handler: REQUEST RECEIVED");
  console.log("clever-handler: METHOD =", req.method);

  try {
    // ==================================================
    // CORS
    // ==================================================

    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
          "Access-Control-Allow-Methods":
            "POST, OPTIONS",
        },
      });
    }

    // ==================================================
    // Only POST is allowed
    // ==================================================

    if (req.method !== "POST") {
      console.log(
        "clever-handler: INVALID METHOD =",
        req.method,
      );

      return new Response(
        JSON.stringify({
          error: "Method not allowed",
          method: req.method,
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // ==================================================
    // Read request body
    // ==================================================

    const rawBody = await req.text();

    console.log(
      "clever-handler: RAW BODY LENGTH =",
      rawBody.length,
    );

    if (!rawBody) {
      console.error(
        "clever-handler: EMPTY REQUEST BODY",
      );

      return new Response(
        JSON.stringify({
          error: "Request body is empty",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // ==================================================
    // Parse JSON
    // ==================================================

    let body: {
      name?: string;
      age?: number | string;
      phone?: string;
      preferredDate?: string;
      preferredTime?: string;
      reasonForVisit?: string;
      notificationChannel?: string;
    };

    try {
      body = JSON.parse(rawBody);

      console.log(
        "clever-handler: BODY PARSED",
      );
    } catch (error) {
      console.error(
        "clever-handler: JSON PARSE ERROR:",
        error,
      );

      return new Response(
        JSON.stringify({
          error: "Invalid JSON body",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // ==================================================
    // Extract booking fields
    // ==================================================

    const {
      name,
      age,
      phone,
      preferredDate,
      preferredTime,
      reasonForVisit,
    } = body;

    console.log(
      "clever-handler: BEFORE VALIDATION",
    );

    // ==================================================
    // Validate required fields
    // ==================================================

    if (
      !name ||
      age === undefined ||
      age === null ||
      !phone ||
      !preferredDate ||
      !preferredTime
    ) {
      console.error(
        "clever-handler: VALIDATION FAILED",
      );

      return new Response(
        JSON.stringify({
          error: "Missing required booking fields",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // ==================================================
    // Validate age
    // ==================================================

    const numericAge = Number(age);

    if (
      Number.isNaN(numericAge) ||
      numericAge <= 0
    ) {
      console.error(
        "clever-handler: INVALID AGE",
      );

      return new Response(
        JSON.stringify({
          error: "Invalid age",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // ==================================================
    // Normalize values
    // ==================================================

    const patientName = String(name).trim();

    const patientPhone = String(phone).trim();

    const patientReason = reasonForVisit
      ? String(reasonForVisit).trim()
      : null;

    console.log(
      "clever-handler: BEFORE DB INSERT",
    );

    // ==================================================
    // Insert appointment
    // ==================================================

    const { data, error } = await supabase
      .from("patients")
      .insert({
        name: patientName,
        age: numericAge,
        phone: patientPhone,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        reason_for_visit: patientReason,
        status: "pending",
        notification_channel: "sms",
        notification_status: "pending",
      })
      .select()
      .single();

    console.log(
      "clever-handler: AFTER DB INSERT",
    );

    // ==================================================
    // Database error
    // ==================================================

    if (error) {
      console.error(
        "clever-handler: DB ERROR:",
        error,
      );

      return new Response(
        JSON.stringify({
          error: "Failed to create appointment",
          details: error.message,
          code: error.code,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // ==================================================
    // Success
    // ==================================================

    console.log(
      "clever-handler: SUCCESS",
    );

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Appointment request created successfully",
        patient: data,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    // ==================================================
    // Unexpected error
    // ==================================================

    console.error(
      "clever-handler: ERROR:",
      error,
    );

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
