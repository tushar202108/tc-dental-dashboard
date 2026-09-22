// import { createClient } from 'jsr:@supabase/supabase-js@2';


// // ======================================================
// // CORS
// // ======================================================

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',

//   'Access-Control-Allow-Headers':
//     'authorization, x-client-info, apikey, content-type',

//   'Access-Control-Allow-Methods':
//     'POST, OPTIONS',
// };


// // ======================================================
// // SEND SMS NOTIFICATION
// // ======================================================

// // const sendSmsNotification = async (
// //   patient: any,
// //   status: 'approved' | 'denied',
// // ) => {

// //   // ====================================================
// //   // TWILIO CONFIG
// //   // ====================================================

// //   const accountSid =
// //     Deno.env.get('TWILIO_ACCOUNT_SID');

// //   const authToken =
// //     Deno.env.get('TWILIO_AUTH_TOKEN');

// //   const smsFrom =
// //     Deno.env.get('TWILIO_SMS_FROM');


// //   // ====================================================
// //   // CONFIG DEBUG
// //   // ====================================================

// //   console.log(
// //     '========== TWILIO SMS CONFIG =========='
// //   );

// //   console.log({
// //     accountSidPrefix:
// //       accountSid?.substring(0, 4),

// //     accountSidLength:
// //       accountSid?.length,

// //     hasAuthToken:
// //       !!authToken,

// //     smsFromPrefix:
// //       smsFrom?.substring(0, 5),

// //     smsFromLength:
// //       smsFrom?.length,
// //   });

// //   console.log(
// //     '======================================='
// //   );


// //   // ====================================================
// //   // VALIDATION
// //   // ====================================================

// //   if (!accountSid) {
// //     throw new Error(
// //       'TWILIO_ACCOUNT_SID is missing',
// //     );
// //   }

// //   if (!authToken) {
// //     throw new Error(
// //       'TWILIO_AUTH_TOKEN is missing',
// //     );
// //   }

// //   if (!smsFrom) {
// //     throw new Error(
// //       'TWILIO_SMS_FROM is missing',
// //     );
// //   }

// //   if (!patient.phone) {
// //     throw new Error(
// //       'Patient phone number is missing',
// //     );
// //   }


// //   // ====================================================
// //   // TWILIO AUTH
// //   // ====================================================

// //   const credentials = btoa(
// //     `${accountSid}:${authToken}`,
// //   );


// //   // ====================================================
// //   // APPOINTMENT DATA
// //   // ====================================================

// //   const appointmentDate =
// //     patient.preferred_date;

// //   const appointmentTime =
// //     patient.preferred_time;


// //   // ====================================================
// //   // SMS MESSAGE
// //   // ====================================================

// //   let messageBody = '';


// //   if (
// //     status === 'approved'
// //   ) {

// //     messageBody =
// //       `Hello ${patient.name}, your appointment with TC Dental Care has been approved for ${appointmentDate} at ${appointmentTime}. We look forward to seeing you.`;
// //   }

// //   else {

// //     messageBody =
// //       `Hello ${patient.name}, your appointment request for ${appointmentDate} at ${appointmentTime} has been declined by TC Dental Care. Please contact TC Dental Care for assistance.`;
// //   }


// //   // ====================================================
// //   // FORM DATA
// //   // ====================================================

// //   const params =
// //     new URLSearchParams();


// //   // ====================================================
// //   // SMS DESTINATION
// //   // ====================================================

// //   params.set(
// //     'To',
// //     patient.phone,
// //   );


// //   // ====================================================
// //   // SMS SENDER
// //   // ====================================================

// //   params.set(
// //     'From',
// //     smsFrom,
// //   );


// //   // ====================================================
// //   // SMS BODY
// //   // ====================================================

// //   params.set(
// //     'Body',
// //     messageBody,
// //   );


// //   // ====================================================
// //   // REQUEST DEBUG
// //   // ====================================================

// //   console.log(
// //     '========== TWILIO SMS REQUEST =========='
// //   );

// //   console.log({
// //     to:
// //       patient.phone,

// //     from:
// //       smsFrom,

// //     body:
// //       messageBody,

// //     hasAccountSid:
// //       !!accountSid,

// //     hasAuthToken:
// //       !!authToken,
// //   });

// //   console.log(
// //     '========================================'
// //   );


// //   // ====================================================
// //   // TWILIO API URL
// //   // ====================================================

// //   const twilioUrl =
// //     `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;


// //   console.log(
// //     'TWILIO URL:',
// //     twilioUrl,
// //   );


// //   // ====================================================
// //   // SEND SMS
// //   // ====================================================

// //   const response =
// //     await fetch(
// //       twilioUrl,
// //       {
// //         method:
// //           'POST',

// //         headers: {

// //           Authorization:
// //             `Basic ${credentials}`,

// //           'Content-Type':
// //             'application/x-www-form-urlencoded',
// //         },

// //         body:
// //           params.toString(),
// //       },
// //     );


// //   // ====================================================
// //   // READ RESPONSE
// //   // ====================================================

// //   const responseText =
// //     await response.text();


// //   // ====================================================
// //   // TWILIO RESPONSE DEBUG
// //   // ====================================================

// //   console.log(
// //     '========== TWILIO SMS RESPONSE =========='
// //   );

// //   console.log(
// //     'STATUS:',
// //     response.status,
// //   );

// //   console.log(
// //     'OK:',
// //     response.ok,
// //   );

// //   console.log(
// //     'BODY:',
// //     responseText,
// //   );

// //   console.log(
// //     '========================================='
// //   );


// //   // ====================================================
// //   // PARSE RESPONSE
// //   // ====================================================

// //   let result: any;


// //   try {

// //     result =
// //       JSON.parse(
// //         responseText,
// //       );

// //   }

// //   catch {

// //     result = {
// //       message:
// //         responseText,
// //     };
// //   }


// //   // ====================================================
// //   // TWILIO ERROR
// //   // ====================================================

// //   if (!response.ok) {

// //     throw new Error(
// //       result?.message ||
// //         `Twilio SMS failed with HTTP ${response.status}`,
// //     );
// //   }


// //   // ====================================================
// //   // SMS SUCCESS
// //   // ====================================================

// //   console.log(
// //     '========== SMS SENT SUCCESSFULLY =========='
// //   );

// //   console.log({
// //     sid:
// //       result?.sid,

// //     status:
// //       result?.status,

// //     to:
// //       result?.to,

// //     from:
// //       result?.from,
// //   });

// //   console.log(
// //     '==========================================='
// //   );


// //   return result;
// // };


// // ======================================================
// // SUPABASE EDGE FUNCTION
// // ======================================================

// Deno.serve(
//   async (req) => {

//     // ==================================================
//     // CORS
//     // ==================================================

//     if (
//       req.method ===
//       'OPTIONS'
//     ) {

//       return new Response(
//         'ok',
//         {
//           headers:
//             corsHeaders,
//         },
//       );
//     }


//     // ==================================================
//     // ONLY POST
//     // ==================================================

//     if (
//       req.method !==
//       'POST'
//     ) {

//       return new Response(

//         JSON.stringify({

//           success:
//             false,

//           error:
//             'Only POST is allowed',
//         }),

//         {
//           status:
//             405,

//           headers: {

//             ...corsHeaders,

//             'Content-Type':
//               'application/json',
//           },
//         },
//       );
//     }


//     try {

//       // ==================================================
//       // REQUEST BODY
//       // ==================================================

//       const body =
//         await req.json();


//       console.log(
//         '===================================='
//       );

//       console.log(
//         'APPOINTMENT ACTION:',
//         body,
//       );

//       console.log(
//         '===================================='
//       );


//       // ==================================================
//       // GET REQUEST VALUES
//       // ==================================================

//       const appointmentId =
//         body.appointmentId;


//       const requestedStatus =
//         body.status?.toLowerCase();


//       // ==================================================
//       // VALIDATE APPOINTMENT ID
//       // ==================================================

//       if (!appointmentId) {

//         return new Response(

//           JSON.stringify({

//             success:
//               false,

//             error:
//               'appointmentId is required',
//           }),

//           {
//             status:
//               400,

//             headers: {

//               ...corsHeaders,

//               'Content-Type':
//                 'application/json',
//             },
//           },
//         );
//       }


//       // ==================================================
//       // VALIDATE STATUS
//       // ==================================================

//       if (
//         requestedStatus !==
//           'approved' &&

//         requestedStatus !==
//           'denied'
//       ) {

//         return new Response(

//           JSON.stringify({

//             success:
//               false,

//             error:
//               'Status must be approved or denied',
//           }),

//           {
//             status:
//               400,

//             headers: {

//               ...corsHeaders,

//               'Content-Type':
//                 'application/json',
//             },
//           },
//         );
//       }


//       // ==================================================
//       // SUPABASE SERVICE ROLE CLIENT
//       // ==================================================

//       const supabase =
//         createClient(

//           Deno.env.get(
//             'SUPABASE_URL',
//           )!,

//           Deno.env.get(
//             'SUPABASE_SERVICE_ROLE_KEY',
//           )!,
//         );


//       // ==================================================
//       // GET PATIENT
//       // ==================================================

//       const {
//         data: patient,
//         error: patientError,
//       } =
//         await supabase

//           .from(
//             'patients',
//           )

//           .select('*')

//           .eq(
//             'id',
//             appointmentId,
//           )

//           .single();


//       // ==================================================
//       // PATIENT FETCH ERROR
//       // ==================================================

//       if (
//         patientError
//       ) {

//         console.error(
//           'PATIENT FETCH ERROR:',
//           patientError,
//         );

//         throw new Error(
//           patientError.message,
//         );
//       }


//       // ==================================================
//       // PATIENT FOUND
//       // ==================================================

//       console.log(
//         '========== PATIENT FOUND =========='
//       );

//       console.log({

//         id:
//           patient.id,

//         name:
//           patient.name,

//         phone:
//           patient.phone,

//         preferred_date:
//           patient.preferred_date,

//         preferred_time:
//           patient.preferred_time,

//         current_status:
//           patient.status,
//       });

//       console.log(
//         '==================================='
//       );


//       // ==================================================
//       // UPDATE APPOINTMENT STATUS
//       // ==================================================

//       const {
//         data:
//           updatedPatient,

//         error:
//           updateError,
//       } =
//         await supabase

//           .from(
//             'patients',
//           )

//           .update({

//             status:
//               requestedStatus,

//             updated_at:
//               new Date()
//                 .toISOString(),
//           })

//           .eq(
//             'id',
//             appointmentId,
//           )

//           .select()

//           .single();


//       // ==================================================
//       // STATUS UPDATE ERROR
//       // ==================================================

//       if (
//         updateError
//       ) {

//         console.error(
//           'STATUS UPDATE ERROR:',
//           updateError,
//         );

//         throw new Error(
//           updateError.message,
//         );
//       }


//       // ==================================================
//       // STATUS UPDATED
//       // ==================================================

//       console.log(
//         'PATIENT STATUS UPDATED:',
//         updatedPatient.status,
//       );


//       // ==================================================
//       // NOTIFICATION VARIABLES
//       // ==================================================

//       let notificationStatus:
//         'sent' | 'failed' =
//           'sent';


//       let notificationMessageId:
//         string | null =
//           null;


//       let notificationError:
//         string | null =
//           null;


//       // ==================================================
//       // SEND SMS
//       // ==================================================

//       try {

//         console.log(
//           '===================================='
//         );

//         console.log(
//           'STARTING SMS NOTIFICATION'
//         );

//         console.log({

//           appointmentId:
//             updatedPatient.id,

//           status:
//             requestedStatus,

//           phone:
//             updatedPatient.phone,
//         });

//         console.log(
//           '===================================='
//         );


//         const result =
//           await sendSmsNotification(
//             updatedPatient,
//             requestedStatus,
//           );


//         notificationMessageId =
//           result?.sid ||
//           null;


//         console.log(
//           'SMS NOTIFICATION SUCCESS:',
//           {
//             sid:
//               notificationMessageId,
//           },
//         );

//       }

//       catch (
//         error
//       ) {

//         notificationStatus =
//           'failed';


//         notificationError =
//           error instanceof Error
//             ? error.message
//             : 'SMS notification failed';


//         console.error(
//           '===================================='
//         );

//         console.error(
//           'SMS NOTIFICATION ERROR:',
//           error,
//         );

//         console.error(
//           'SMS NOTIFICATION ERROR MESSAGE:',
//           notificationError,
//         );

//         console.error(
//           '===================================='
//         );
//       }


//       // ==================================================
//       // SAVE NOTIFICATION RESULT
//       // ==================================================

//       const {
//         error:
//           notificationUpdateError,
//       } =
//         await supabase

//           .from(
//             'patients',
//           )

//           .update({

//             notification_status:
//               notificationStatus,

//             notification_message_id:
//               notificationMessageId,

//             notification_error:
//               notificationError,

//             updated_at:
//               new Date()
//                 .toISOString(),
//           })

//           .eq(
//             'id',
//             appointmentId,
//           );


//       // ==================================================
//       // NOTIFICATION UPDATE ERROR
//       // ==================================================

//       if (
//         notificationUpdateError
//       ) {

//         console.error(
//           'NOTIFICATION STATUS UPDATE ERROR:',
//           notificationUpdateError,
//         );
//       }


//       // ==================================================
//       // FINAL RESULT
//       // ==================================================

//       console.log(
//         '========== FINAL RESULT =========='
//       );

//       console.log({

//         appointmentId:
//           appointmentId,

//         appointmentStatus:
//           requestedStatus,

//         notificationStatus:
//           notificationStatus,

//         notificationMessageId:
//           notificationMessageId,

//         notificationError:
//           notificationError,
//       });

//       console.log(
//         '=================================='
//       );


//       // ==================================================
//       // FINAL RESPONSE
//       // ==================================================

//       return new Response(

//         JSON.stringify({

//           success:
//             true,

//           appointment: {

//             ...updatedPatient,

//             notification_status:
//               notificationStatus,

//             notification_message_id:
//               notificationMessageId,

//             notification_error:
//               notificationError,
//           },

//           notification:
//             notificationStatus,

//           notificationMessageId,

//           notificationError,
//         }),

//         {
//           status:
//             200,

//           headers: {

//             ...corsHeaders,

//             'Content-Type':
//               'application/json',
//           },
//         },
//       );

//     }

//     catch (
//       error
//     ) {

//       // ==================================================
//       // MAIN ERROR
//       // ==================================================

//       console.error(
//         '===================================='
//       );

//       console.error(
//         'APPOINTMENT ACTION ERROR:',
//         error,
//       );

//       console.error(
//         '===================================='
//       );


//       return new Response(

//         JSON.stringify({

//           success:
//             false,

//           error:
//             error instanceof Error
//               ? error.message
//               : 'Unexpected error',
//         }),

//         {
//           status:
//             500,

//           headers: {

//             ...corsHeaders,

//             'Content-Type':
//               'application/json',
//           },
//         },
//       );
//     }
//   },
// );
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
);

type AppointmentStatus = 'approved' | 'denied';

/**
 * Send SMS using Twilio Trial predefined template.
 *
 * IMPORTANT:
 * Twilio Trial does not allow custom SMS bodies.
 *
 * Customer Support / Chat template:
 * sms_customer_support
 */
const sendSmsNotification = async (
  patient: any,
  status: AppointmentStatus,
) => {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const smsFrom = Deno.env.get('TWILIO_SMS_FROM');

  if (!accountSid) {
    throw new Error('TWILIO_ACCOUNT_SID is missing');
  }

  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is missing');
  }

  if (!smsFrom) {
    throw new Error('TWILIO_SMS_FROM is missing');
  }

  if (!patient.phone) {
    throw new Error('Patient phone number is missing');
  }

  /**
   * Twilio Trial predefined template.
   *
   * Customer Support / Chat
   */
  const templateName = 'sms_customer_support';

  const credentials = btoa(
    `${accountSid}:${authToken}`,
  );

  const params = new URLSearchParams();

  /**
   * Patient phone number.
   *
   * Example:
   * +918272807336
   */
  params.set(
    'To',
    patient.phone,
  );

  /**
   * Twilio Trial SMS sender.
   *
   * This must be your Twilio Trial SMS number.
   */
  params.set(
    'From',
    smsFrom,
  );

  /**
   * IMPORTANT:
   *
   * Do NOT put your custom appointment message here.
   *
   * Trial requires one of Twilio's predefined templates.
   */
  params.set(
    'Body',
    templateName,
  );

  const twilioUrl =
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  console.log('========================================');
  console.log('STARTING TRIAL SMS NOTIFICATION');
  console.log('========================================');

  console.log({
    to: patient.phone,
    from: smsFrom,
    template: templateName,
    appointmentStatus: status,
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
  });

  console.log('========================================');
  console.log('TWILIO SMS REQUEST');
  console.log('========================================');

  console.log({
    To: patient.phone,
    From: smsFrom,
    Body: templateName,
  });

  const response = await fetch(
    twilioUrl,
    {
      method: 'POST',

      headers: {
        Authorization:
          `Basic ${credentials}`,

        'Content-Type':
          'application/x-www-form-urlencoded',
      },

      body: params.toString(),
    },
  );

  const responseText =
    await response.text();

  let result: any;

  try {
    result =
      JSON.parse(responseText);
  } catch {
    result = {
      message: responseText,
    };
  }

  console.log(
    '========== TWILIO SMS RESPONSE ==========',
  );

  console.log(
    'STATUS:',
    response.status,
  );

  console.log(
    'OK:',
    response.ok,
  );

  console.log(
    'BODY:',
    responseText,
  );

  console.log(
    '=========================================',
  );

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Twilio SMS failed with HTTP ${response.status}`,
    );
  }

  return result;
};

Deno.serve(async (req) => {
  /**
   * CORS
   */
  if (req.method === 'OPTIONS') {
    return new Response(
      'ok',
      {
        headers: corsHeaders,
      },
    );
  }

  /**
   * Only POST is allowed.
   */
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  }

  /**
   * Unique request ID.
   *
   * This helps us identify logs if multiple
   * appointment requests happen at the same time.
   */
  const requestId =
    crypto.randomUUID();

  let appointmentId: string | undefined;
  let status: AppointmentStatus | undefined;

  try {
    /**
     * Read request body.
     */
    const body =
      await req.json();

    appointmentId =
      body?.appointmentId;

    status =
      body?.status;

    console.log(
      '====================================',
    );

    console.log(
      'APPOINTMENT ACTION START',
    );

    console.log({
      requestId,
      appointmentId,
      status,
    });

    console.log(
      '====================================',
    );

    /**
     * Validate appointment ID.
     */
    if (!appointmentId) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'appointmentId is required',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    /**
     * Validate status.
     */
    if (
      status !== 'approved' &&
      status !== 'denied'
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'status must be approved or denied',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    console.log(
      '====================================',
    );

    console.log(
      'APPOINTMENT ACTION:',
      {
        requestId,
        appointmentId,
        status,
      },
    );

    console.log(
      '====================================',
    );

    /**
     * Get patient/appointment.
     */
    const {
      data: patient,
      error: patientError,
    } = await supabase
      .from('patients')
      .select(`
        id,
        name,
        phone,
        preferred_date,
        preferred_time,
        status
      `)
      .eq('id', appointmentId)
      .single();

    if (patientError) {
      console.error(
        'PATIENT FETCH ERROR:',
        patientError,
      );

      throw new Error(
        `Unable to find appointment: ${patientError.message}`,
      );
    }

    if (!patient) {
      throw new Error(
        'Appointment not found',
      );
    }

    console.log(
      '========== PATIENT FOUND ==========',
    );

    console.log({
      requestId,
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      preferred_date:
        patient.preferred_date,
      preferred_time:
        patient.preferred_time,
      current_status:
        patient.status,
    });

    console.log(
      '===================================',
    );

    /**
     * Update appointment status FIRST.
     *
     * Even if Twilio fails, the appointment
     * should remain approved/denied.
     */
    const {
      data: updatedPatient,
      error: updateError,
    } = await supabase
      .from('patients')
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      console.error(
        'PATIENT STATUS UPDATE ERROR:',
        updateError,
      );

      throw new Error(
        `Unable to update appointment status: ${updateError.message}`,
      );
    }

    console.log(
      'PATIENT STATUS UPDATED:',
      updatedPatient?.status,
    );

    /**
     * Default notification values.
     */
    let notificationStatus:
      | 'sent'
      | 'failed' = 'failed';

    let notificationMessageId:
      | string
      | null = null;

    let notificationError:
      | string
      | null = null;

    /**
     * Try to send Trial SMS.
     */
    try {
      console.log(
        '====================================',
      );

      console.log(
        'STARTING TRIAL SMS NOTIFICATION',
      );

      console.log({
        requestId,
        patientId: patient.id,
        name: patient.name,
        phone: patient.phone,
        status,
      });

      console.log(
        '====================================',
      );

      const smsResult =
        await sendSmsNotification(
          patient,
          status,
        );

      notificationStatus =
        'sent';

      notificationMessageId =
        smsResult?.sid ||
        smsResult?.message_sid ||
        null;

      console.log(
        'SMS NOTIFICATION SUCCESS',
      );

      console.log({
        requestId,
        notificationStatus,
        notificationMessageId,
      });
    } catch (smsError) {
      notificationStatus =
        'failed';

      notificationError =
        smsError instanceof Error
          ? smsError.message
          : String(smsError);

      console.error(
        'SMS NOTIFICATION ERROR MESSAGE:',
        notificationError,
      );

      console.error(
        'SMS NOTIFICATION ERROR:',
        smsError,
      );
    }

    /**
     * Save notification result.
     */
    const {
      error: notificationUpdateError,
    } = await supabase
      .from('patients')
      .update({
        notification_channel:
          'sms',

        notification_status:
          notificationStatus,

        notification_message_id:
          notificationMessageId,

        notification_error:
          notificationError,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        appointmentId,
      );

    if (notificationUpdateError) {
      console.error(
        'NOTIFICATION STATUS UPDATE ERROR:',
        notificationUpdateError,
      );
    }

    /**
     * Final result.
     */
    const finalResult = {
      appointmentId,
      appointmentStatus: status,

      notificationStatus,

      notificationMessageId,

      notificationError,
    };

    console.log(
      '====================================',
    );

    console.log(
      'FINAL RESULT',
    );

    console.log({
      requestId,
      ...finalResult,
    });

    console.log(
      '====================================',
    );

    /**
     * Important:
     *
     * We return success even when SMS fails,
     * because the appointment itself was already
     * successfully approved/denied.
     */
    return new Response(
      JSON.stringify({
        success: true,
        ...finalResult,
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
      '====================================',
    );

    console.error(
      'APPOINTMENT ACTION ERROR',
    );

    console.error({
      requestId,
      appointmentId,
      status,
      error,
    });

    console.error(
      '====================================',
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        appointmentId:
          appointmentId ?? null,
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
});