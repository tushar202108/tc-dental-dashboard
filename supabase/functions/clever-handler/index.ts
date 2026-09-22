import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

console.log("clever-handler: START");

Deno.serve(async (req) => {
  console.log("clever-handler: REQUEST RECEIVED");
  console.log("clever-handler: METHOD =", req.method);

  try {
    const rawBody = await req.text();

    console.log(
      "clever-handler: RAW BODY LENGTH =",
      rawBody.length,
    );

    let body;

    try {
      body = JSON.parse(rawBody);
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
          },
        },
      );
    }

    console.log("clever-handler: BODY PARSED");
   const rawBody = await req.text();

console.log("clever-handler: RAW BODY:", rawBody);

let body;

try {
  body = JSON.parse(rawBody);
} catch (error) {
  console.error("clever-handler: JSON PARSE ERROR:", error);

  return new Response(
    JSON.stringify({
      error: "Invalid JSON body",
      rawBody,
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

console.log("clever-handler: BODY PARSED:", body);

    const {
      name,
      age,
      phone,
      preferredDate,
      preferredTime,
      reasonForVisit,
    } = body;

    console.log("clever-handler: BEFORE VALIDATION");

    if (
      !name ||
      age === undefined ||
      age === null ||
      !phone ||
      !preferredDate ||
      !preferredTime
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required booking fields",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("clever-handler: BEFORE DB INSERT");

    const { data, error } = await supabase
      .from("patients")
      .insert({
        name: String(name).trim(),
        age: Number(age),
        phone: String(phone).trim(),
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        reason_for_visit: reasonForVisit
          ? String(reasonForVisit).trim()
          : null,
        status: "pending",
        notification_channel: "sms",
        notification_status: "pending",
      })
      .select()
      .single();

    console.log("clever-handler: AFTER DB INSERT");

    if (error) {
      console.error("clever-handler: DB ERROR:", error);

      return new Response(
        JSON.stringify({
          error: "Failed to create appointment",
          details: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("clever-handler: SUCCESS");

    return new Response(
      JSON.stringify({
        success: true,
        patient: data,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("clever-handler: ERROR:", error);

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
        },
      },
    );
  }
});
