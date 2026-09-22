import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Avatar,
  Button,
  Card,
  Flex,
  Grid,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';

import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';

import dayjs from 'dayjs';

import { supabase } from '../../lib/supabase';

import ScheduleReminder from '../../components/ScheduleReminder/ScheduleReminder';

const { Title, Text } =
  Typography;

type PatientStatus =
  | 'Pending'
  | 'Approved'
  | 'Denied';

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: PatientStatus;
  reminderAt: string | null;
  reminderStatus: string;
  notificationChannel: string;
}

const normalizeStatus = (
  value: string,
): PatientStatus => {
  if (value === 'approved') {
    return 'Approved';
  }

  if (value === 'denied') {
    return 'Denied';
  }

  return 'Pending';
};

const formatTime = (
  value: string,
) => {
  if (!value) {
    return '';
  }

  if (
    value.includes('AM') ||
    value.includes('PM')
  ) {
    return value;
  }

  const parsed = dayjs(
    `2000-01-01T${value}`,
  );

  return parsed.isValid()
    ? parsed.format('hh:mm A')
    : value;
};

const Patients = () => {
  const screens =
    Grid.useBreakpoint();

  const isMobile = !screens.md;

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<
      PatientStatus | 'All'
    >('All');

  const [
    reminderPatient,
    setReminderPatient,
  ] = useState<Patient | null>(null);

  const loadPatients = async () => {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.error(
          'Patients loading error:',
          error,
        );

        message.error(
          'Unable to load patients',
        );

        return;
      }

      const mapped: Patient[] =
        (data || []).map((item) => ({
          id: item.id,
          name: item.name || '',
          age: item.age || 0,
          phone: item.phone || '',
          appointmentDate:
            item.preferred_date || '',
          appointmentTime:
            item.preferred_time || '',
          reason:
            item.reason_for_visit || '',
          status: normalizeStatus(
            item.status,
          ),
          reminderAt:
            item.reminder_at || null,
          reminderStatus:
            item.reminder_status ||
            'not_scheduled',
          notificationChannel:
            item.notification_channel ||
            'sms',
        }));

      setPatients(mapped);
    } catch (error) {
      console.error(error);

      message.error(
        'Unable to load patients',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return patients.filter(
        (patient) => {
          const matchesSearch =
            !searchValue ||
            patient.name
              .toLowerCase()
              .includes(searchValue) ||
            patient.phone
              .toLowerCase()
              .includes(searchValue) ||
            patient.reason
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            statusFilter === 'All' ||
            patient.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      patients,
      search,
      statusFilter,
    ]);

  const renderStatus = (
    status: PatientStatus,
  ) => {
    if (status === 'Approved') {
      return (
        <Tag
          color="success"
          icon={
            <CheckCircleOutlined />
          }
        >
          Approved
        </Tag>
      );
    }

    if (status === 'Denied') {
      return (
        <Tag
          color="error"
          icon={
            <CloseCircleOutlined />
          }
        >
          Denied
        </Tag>
      );
    }

    return (
      <Tag
        color="warning"
        icon={
          <ClockCircleOutlined />
        }
      >
        Pending
      </Tag>
    );
  };

  const renderReminderStatus = (
    patient: Patient,
  ) => {
    if (
      patient.reminderStatus ===
      'sent'
    ) {
      return (
        <Tag color="success">
          Sent
        </Tag>
      );
    }

    if (
      patient.reminderStatus ===
      'processing'
    ) {
      return (
        <Tag color="processing">
          Sending
        </Tag>
      );
    }

    if (
      patient.reminderStatus ===
      'failed'
    ) {
      return (
        <Tag color="error">
          Failed
        </Tag>
      );
    }

    if (
      patient.reminderStatus ===
      'pending'
    ) {
      return (
        <Tag color="blue">
          Scheduled
        </Tag>
      );
    }

    return (
      <Tag>
        Not Scheduled
      </Tag>
    );
  };

  const columns: ColumnsType<Patient> =
    [
      {
        title: 'Patient',
        key: 'patient',
        fixed: 'left',
        width: 220,
        render: (_, record) => (
          <Flex
            align="center"
            gap={10}
          >
            <Avatar
              size={40}
              icon={<UserOutlined />}
            />

            <Flex vertical>
              <Text strong>
                {record.name}
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                Age {record.age}
              </Text>
            </Flex>
          </Flex>
        ),
      },

      {
        title: 'Phone',
        key: 'phone',
        width: 170,
        render: (_, record) => (
          <a
            href={`tel:${record.phone}`}
          >
            <Space>
              <PhoneOutlined />

              {record.phone ||
                '-'}
            </Space>
          </a>
        ),
      },

      {
        title: 'Appointment',
        key: 'appointment',
        width: 190,
        render: (_, record) => (
          <Flex vertical gap={4}>
            <Space>
              <CalendarOutlined />

              {dayjs(
                record.appointmentDate,
              ).format(
                'DD MMM YYYY',
              )}
            </Space>

            <Space>
              <ClockCircleOutlined />

              {formatTime(
                record.appointmentTime,
              )}
            </Space>
          </Flex>
        ),
      },

      {
        title: 'Reason',
        dataIndex: 'reason',
        key: 'reason',
        width: 220,
        render: (
          value: string,
        ) => (
          <Text
            ellipsis={{
              tooltip: value,
            }}
          >
            {value || '-'}
          </Text>
        ),
      },

      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (status) =>
          renderStatus(status),
      },

      {
        title: 'Reminder',
        key: 'reminder',
        width: 230,
        render: (_, record) => (
          <Flex
            vertical
            gap={5}
          >
            {renderReminderStatus(
              record,
            )}

            {record.reminderAt && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                {dayjs(
                  record.reminderAt,
                ).format(
                  'DD MMM YYYY hh:mm A',
                )}
              </Text>
            )}
          </Flex>
        ),
      },

      {
        title: 'Action',
        key: 'action',
        fixed: 'right',
        width: 180,
        render: (_, record) => (
          <Button
            type="primary"
            icon={<BellOutlined />}
            disabled={
              record.status !==
              'Approved'
            }
            onClick={() =>
              setReminderPatient(
                record,
              )
            }
          >
            {record.reminderStatus ===
            'pending'
              ? 'Reschedule'
              : 'Schedule Reminder'}
          </Button>
        ),
      },
    ];

  return (
    <div
      style={{
        width: '100%',
        padding: isMobile
          ? 12
          : 24,
      }}
    >
      <Flex
        vertical
        gap={4}
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={
            isMobile ? 3 : 2
          }
          style={{
            margin: 0,
          }}
        >
          Patients
        </Title>

        <Text type="secondary">
          Manage patients,
          appointments and
          automated reminders.
        </Text>
      </Flex>

      <Card>
        <Flex
          gap={12}
          wrap="wrap"
          style={{
            marginBottom: 20,
          }}
        >
          <Input
            allowClear
            prefix={
              <SearchOutlined />
            }
            placeholder="Search patient..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            style={{
              width: isMobile
                ? '100%'
                : 320,
            }}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{
              width: isMobile
                ? '100%'
                : 160,
            }}
            options={[
              {
                label: 'All',
                value: 'All',
              },
              {
                label: 'Pending',
                value: 'Pending',
              },
              {
                label: 'Approved',
                value: 'Approved',
              },
              {
                label: 'Denied',
                value: 'Denied',
              },
            ]}
          />

          <Button
            onClick={loadPatients}
            loading={loading}
          >
            Refresh
          </Button>
        </Flex>

        <Table<Patient>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={
            filteredPatients
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          scroll={{
            x: 1250,
          }}
        />
      </Card>

      <ScheduleReminder
        open={
          reminderPatient !== null
        }
        patient={reminderPatient}
        onClose={() =>
          setReminderPatient(null)
        }
        onScheduled={
          loadPatients
        }
      />
    </div>
  );
};

export default Patients;