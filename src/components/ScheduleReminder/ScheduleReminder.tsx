import {
  useEffect,
  useState,
} from 'react';

import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Modal,
  Radio,
  Select,
  Space,
  TimePicker,
  Typography,
  message,
} from 'antd';

import {
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';

import dayjs, {
  Dayjs,
} from 'dayjs';

import { supabase } from '../../lib/supabase';

const { Text } = Typography;

interface Patient {
  id: string;
  name: string;
  appointmentDate: string;
  appointmentTime: string;

  // These are no longer required for scheduling.
  // They can remain if Patients.tsx still provides them.
  reminderAt?: string | null;
  reminderStatus?: string;
  notificationChannel?: string;
}

interface ScheduleReminderProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
  onScheduled: () => void;
}

type ScheduleMode =
  | 'specific'
  | 'before';

const ScheduleReminder = ({
  open,
  patient,
  onClose,
  onScheduled,
}: ScheduleReminderProps) => {
  const [form] =
    Form.useForm();

  const [
    scheduleMode,
    setScheduleMode,
  ] = useState<ScheduleMode>(
    'specific',
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  /*
   * Reset form whenever modal opens
   */
  useEffect(() => {
    if (!open || !patient) {
      return;
    }

    setScheduleMode('specific');

    form.resetFields();

    form.setFieldsValue({
      scheduleMode: 'specific',
      reminderDate: dayjs(),
      reminderTime: dayjs(),
      daysBefore: 1,

      // SMS only
      channel: 'sms',
    });
  }, [
    open,
    patient,
    form,
  ]);

  /*
   * Appointment date
   */
  const appointmentDate = patient
    ? dayjs(patient.appointmentDate)
    : null;

  /*
   * Appointment date + time
   */
  const getAppointmentDateTime =
    (): Dayjs | null => {
      if (
        !patient ||
        !appointmentDate
      ) {
        return null;
      }

      const appointmentTime =
        dayjs(
          patient.appointmentTime,
          [
            'HH:mm:ss',
            'HH:mm',
            'hh:mm A',
          ],
        );

      return appointmentDate
        .hour(
          appointmentTime.hour(),
        )
        .minute(
          appointmentTime.minute(),
        )
        .second(0)
        .millisecond(0);
    };

  /*
   * Calculate reminder date
   */
  const calculateReminderDate = (
    values: any,
  ): Dayjs | null => {
    if (!patient) {
      return null;
    }

    /*
     * Specific date
     */
    if (
      values.scheduleMode ===
      'specific'
    ) {
      if (
        !values.reminderDate ||
        !values.reminderTime
      ) {
        return null;
      }

      return values.reminderDate
        .hour(
          values.reminderTime.hour(),
        )
        .minute(
          values.reminderTime.minute(),
        )
        .second(0)
        .millisecond(0);
    }

    /*
     * Days before appointment
     *
     * IMPORTANT:
     * 0 is valid, so don't use:
     *
     * if (!values.daysBefore)
     *
     */
    if (
      values.daysBefore ===
        undefined ||
      values.daysBefore ===
        null ||
      !values.reminderTime
    ) {
      return null;
    }

    const daysBefore =
      Number(values.daysBefore);

    const appointmentDateTime =
      getAppointmentDateTime();

    if (!appointmentDateTime) {
      return null;
    }

    return appointmentDateTime
      .subtract(
        daysBefore,
        'day',
      )
      .hour(
        values.reminderTime.hour(),
      )
      .minute(
        values.reminderTime.minute(),
      )
      .second(0)
      .millisecond(0);
  };

  /*
   * Schedule reminder
   */
  const handleSchedule =
    async (values: any) => {
      if (!patient) {
        return;
      }

      try {
        setSaving(true);

        /*
         * Calculate reminder timestamp
         */
        const reminderDate =
          calculateReminderDate(
            values,
          );

        if (!reminderDate) {
          message.error(
            'Please select reminder date and time',
          );

          return;
        }

        /*
         * Reminder must be in future
         */
        if (
          !reminderDate.isAfter(
            dayjs(),
          )
        ) {
          message.error(
            'Reminder date and time must be in the future',
          );

          return;
        }

        /*
         * Appointment date + time
         */
        const appointmentDateTime =
          getAppointmentDateTime();

        /*
         * Reminder must be before
         * appointment.
         */
        if (
          appointmentDateTime &&
          !reminderDate.isBefore(
            appointmentDateTime,
          )
        ) {
          message.error(
            'Reminder must be before the appointment time',
          );

          return;
        }

        /*
         * ----------------------------------
         * Cancel existing pending reminder
         * ----------------------------------
         *
         * This prevents multiple pending
         * reminders for the same appointment.
         */
        const {
          error:
            cancelError,
        } = await supabase
          .from('reminders')
          .update({
            status: 'cancelled',
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'patient_id',
            patient.id,
          )
          .eq(
            'status',
            'pending',
          );

        if (cancelError) {
          console.error(
            'Cancel existing reminder error:',
            cancelError,
          );

          message.error(
            cancelError.message ||
              'Unable to update existing reminder',
          );

          return;
        }

        /*
         * ----------------------------------
         * Create new reminder
         * ----------------------------------
         */
        const {
          data,
          error,
        } = await supabase
          .from('reminders')
          .insert({
            patient_id:
              patient.id,

            reminder_at:
              reminderDate.toISOString(),

            // SMS ONLY
            channel: 'sms',

            status: 'pending',

            provider_message_id:
              null,

            error_message:
              null,

            sent_at: null,

            created_at:
              new Date().toISOString(),

            updated_at:
              new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error(
            'Reminder scheduling error:',
            error,
          );

          message.error(
            error.message ||
              'Unable to schedule reminder',
          );

          return;
        }

        console.log(
          'Reminder scheduled:',
          data,
        );

        /*
         * Success
         */
        message.success(
          `SMS reminder scheduled for ${reminderDate.format(
            'DD MMM YYYY hh:mm A',
          )}`,
        );

        onClose();

        onScheduled();
      } catch (error) {
        console.error(
          'Schedule reminder error:',
          error,
        );

        message.error(
          'Unable to schedule reminder',
        );
      } finally {
        setSaving(false);
      }
    };

  /*
   * Disable dates before today
   */
  const disablePastDates = (
    current: Dayjs,
  ) => {
    return current.isBefore(
      dayjs().startOf('day'),
    );
  };

  /*
   * Disable dates after appointment
   */
  const disableInvalidSpecificDates = (
    current: Dayjs,
  ) => {
    if (!appointmentDate) {
      return disablePastDates(
        current,
      );
    }

    return (
      current.isBefore(
        dayjs().startOf('day'),
      ) ||
      current.isAfter(
        appointmentDate.startOf(
          'day',
        ),
      )
    );
  };

  /*
   * Preview reminder
   */
  const previewReminder = () => {
    const values =
      form.getFieldsValue();

    const reminderDate =
      calculateReminderDate(
        values,
      );

    if (!reminderDate) {
      return null;
    }

    return reminderDate.format(
      'DD MMM YYYY hh:mm A',
    );
  };

  return (
    <Modal
      title={
        <Space>
          <SendOutlined />
          Schedule SMS Reminder
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {patient && (
        <>
          {/* Patient information */}
          <Space
            direction="vertical"
            size={2}
            style={{
              width: '100%',
              marginBottom: 20,
            }}
          >
            <Text strong>
              {patient.name}
            </Text>

            <Text type="secondary">
              Appointment:{' '}
              {dayjs(
                patient.appointmentDate,
              ).format(
                'DD MMM YYYY',
              )}{' '}
              at{' '}
              {patient.appointmentTime}
            </Text>
          </Space>

          <Form
            form={form}
            layout="vertical"
            onFinish={
              handleSchedule
            }
          >
            {/* Schedule type */}
            <Form.Item
              label="Schedule Reminder"
              name="scheduleMode"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Radio.Group
                onChange={(event) => {
                  const mode =
                    event.target
                      .value as ScheduleMode;

                  setScheduleMode(mode);

                  if (
                    mode ===
                    'specific'
                  ) {
                    form.setFieldsValue({
                      reminderDate:
                        dayjs(),
                      reminderTime:
                        dayjs(),
                    });
                  } else {
                    form.setFieldsValue({
                      daysBefore: 1,
                      reminderTime:
                        dayjs(),
                    });
                  }
                }}
              >
                <Space
                  direction="vertical"
                >
                  <Radio value="specific">
                    Specific Date & Time
                  </Radio>

                  <Radio value="before">
                    Days Before Appointment
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {/* Specific date */}
            {scheduleMode ===
              'specific' && (
              <>
                <Form.Item
                  label="Reminder Date"
                  name="reminderDate"
                  rules={[
                    {
                      required: true,
                      message:
                        'Select reminder date',
                    },
                  ]}
                >
                  <DatePicker
                    style={{
                      width: '100%',
                    }}
                    format="DD MMM YYYY"
                    disabledDate={
                      disableInvalidSpecificDates
                    }
                    suffixIcon={
                      <CalendarOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Reminder Time"
                  name="reminderTime"
                  rules={[
                    {
                      required: true,
                      message:
                        'Select reminder time',
                    },
                  ]}
                >
                  <TimePicker
                    style={{
                      width: '100%',
                    }}
                    format="hh:mm A"
                    minuteStep={5}
                    use12Hours
                    suffixIcon={
                      <ClockCircleOutlined />
                    }
                  />
                </Form.Item>
              </>
            )}

            {/* Days before */}
            {scheduleMode ===
              'before' && (
              <>
                <Form.Item
                  label="Days Before Appointment"
                  name="daysBefore"
                  rules={[
                    {
                      required: true,
                      message:
                        'Select days',
                    },
                  ]}
                >
                  <Select
                    options={[
                      {
                        label:
                          'On appointment day',
                        value: 0,
                      },
                      {
                        label:
                          '1 day before',
                        value: 1,
                      },
                      {
                        label:
                          '2 days before',
                        value: 2,
                      },
                      {
                        label:
                          '3 days before',
                        value: 3,
                      },
                      {
                        label:
                          '4 days before',
                        value: 4,
                      },
                      {
                        label:
                          '5 days before',
                        value: 5,
                      },
                      {
                        label:
                          '7 days before',
                        value: 7,
                      },
                      {
                        label:
                          '14 days before',
                        value: 14,
                      },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Reminder Time"
                  name="reminderTime"
                  rules={[
                    {
                      required: true,
                      message:
                        'Select reminder time',
                    },
                  ]}
                >
                  <TimePicker
                    style={{
                      width: '100%',
                    }}
                    format="hh:mm A"
                    minuteStep={5}
                    use12Hours
                    suffixIcon={
                      <ClockCircleOutlined />
                    }
                  />
                </Form.Item>
              </>
            )}

            {/* SMS only */}
            <Form.Item
              label="Send Reminder Via"
            >
              <Select
                value="sms"
                disabled
                options={[
                  {
                    label: 'SMS',
                    value: 'sms',
                  },
                ]}
              />
            </Form.Item>

            {/* Preview */}
            {previewReminder() && (
              <Card
                size="small"
                style={{
                  marginBottom: 20,
                }}
              >
                <Text type="secondary">
                  SMS reminder will be sent on
                </Text>

                <br />

                <Text strong>
                  {previewReminder()}
                </Text>
              </Card>
            )}

            {/* Buttons */}
            <Flex
              justify="end"
              gap={8}
            >
              <Button
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={
                  <BellOutlined />
                }
              >
                Schedule SMS Reminder
              </Button>
            </Flex>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default ScheduleReminder;