import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':
    '*',

  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const sendReminder = async (
  patient: any,
) => {
  const accountSid =
    Deno.env.get(
      'TWILIO_ACCOUNT_SID',
    );

  const authToken =
    Deno.env.get(
      'TWILIO_AUTH_TOKEN',
    );

  const smsFrom =
    Deno.env.get(
      'TWILIO_SMS_FROM',
    );

  const whatsappFrom =
    Deno.env.get(
      'TWILIO_WHATSAPP_FROM',
    );

  const whatsappContentSid =
    Deno.env.get(
      'TWILIO_REMINDER_CONTENT_SID',
    );

  if (
    !accountSid ||
    !authToken
  ) {
    throw new Error(
      'Twilio credentials are missing',
    );
  }

  const credentials =
    btoa(
      `${accountSid}:${authToken}`,
    );

  const params =
    new URLSearchParams();

  const appointmentDate =
    patient.preferred_date;

  const appointmentTime =
    patient.preferred_time;

  const messageBody =
    `Hello ${patient.name}, this is a reminder from TC Dental Care. Your appointment is scheduled for ${appointmentDate} at ${appointmentTime}.`;

  if (
    patient.notification_channel ===
    'sms'
  ) {
    if (!smsFrom) {
      throw new Error(
        'TWILIO_SMS_FROM is missing',
      );
    }

    params.set(
      'To',
      patient.phone,
    );

    params.set(
      'From',
      smsFrom,
    );

    params.set(
      'Body',
      messageBody,
    );
  } else {
    if (
      !whatsappFrom ||
      !whatsappContentSid
    ) {
      throw new Error(
        'WhatsApp reminder configuration is missing',
      );
    }

    params.set(
      'To',
      `whatsapp:${patient.phone}`,
    );

    params.set(
      'From',
      `whatsapp:${whatsappFrom}`,
    );

    params.set(
      'ContentSid',
      whatsappContentSid,
    );

params.set(
  'ContentVariables',
  JSON.stringify({
    '1': appointmentDate,
    '2': appointmentTime,
  }),
);
  }

  const response =
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',

        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type':
            'application/x-www-form-urlencoded',
        },

        body:
          params.toString(),
      },
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        'Twilio reminder failed',
    );
  }

  return result;
};

Deno.serve(
  async (req) => {
    if (
      req.method ===
      'OPTIONS'
    ) {
      return new Response(
        'ok',
        {
          headers:
            corsHeaders,
        },
      );
    }

    try {
      const supabase =
        createClient(
          Deno.env.get(
            'SUPABASE_URL',
          )!,

          Deno.env.get(
            'SUPABASE_SERVICE_ROLE_KEY',
          )!,
        );

      /*
       * Find reminders that are due.
       */

      const {
        data: reminders,
        error,
      } = await supabase
        .from('patients')
        .select('*')
        .eq(
          'status',
          'approved',
        )
        .eq(
          'reminder_status',
          'pending',
        )
        .not(
          'reminder_at',
          'is',
          null,
        )
        .lte(
          'reminder_at',
          new Date().toISOString(),
        )
        .limit(50);

      if (error) {
        throw new Error(
          error.message,
        );
      }

      const results = [];

      for (
        const patient of
        reminders || []
      ) {
        /*
         * Claim reminder first.
         *
         * This prevents the same reminder
         * from being processed by multiple
         * cron executions.
         */

        const {
          data: claimed,
          error:
            claimError,
        } = await supabase
          .from('patients')
          .update({
            reminder_status:
              'processing',

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            patient.id,
          )
          .eq(
            'reminder_status',
            'pending',
          )
          .select('id')
          .maybeSingle();

        if (
          claimError ||
          !claimed
        ) {
          continue;
        }

        try {
          const result =
            await sendReminder(
              patient,
            );

          await supabase
            .from('patients')
            .update({
              reminder_status:
                'sent',

              reminder_message_id:
                result.sid ||
                null,

              reminder_error:
                null,

              reminder_sent_at:
                new Date().toISOString(),

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              'id',
              patient.id,
            );

          results.push({
            id: patient.id,
            status: 'sent',
          });
        } catch (
          reminderError
        ) {
          const errorMessage =
            reminderError instanceof
            Error
              ? reminderError.message
              : 'Reminder failed';

          await supabase
            .from('patients')
            .update({
              reminder_status:
                'failed',

              reminder_error:
                errorMessage,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              'id',
              patient.id,
            );

          results.push({
            id: patient.id,
            status: 'failed',
            error:
              errorMessage,
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed:
            results.length,
          results,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    } catch (error) {
      console.error(
        'REMINDER RUNNER ERROR:',
        error,
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unexpected error',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }
  },
);