import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import {
  Avatar,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Flex,
  Grid,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';

import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PhoneOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';

import { supabase } from '../../lib/supabase';

const { Title, Text } = Typography;

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
}

interface ConfirmationState {
  patient: Patient;
  action: 'Approved' | 'Denied';
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

const formatAppointmentDate = (
  value: string,
) => {
  if (!value) {
    return '';
  }

  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return value;
  }

  return parsed.format('DD MMM YYYY');
};

const formatAppointmentTime = (
  value: string,
) => {
  if (!value) {
    return '';
  }

  // Already formatted from frontend
  if (
    value.toUpperCase().includes('AM') ||
    value.toUpperCase().includes('PM')
  ) {
    return value;
  }

  // PostgreSQL time can come as 11:00:00
  const parsed = dayjs(
    `2000-01-01T${value}`,
  );

  if (parsed.isValid()) {
    return parsed.format('hh:mm A');
  }

  return value;
};

const Dashboard = () => {
  const screens = Grid.useBreakpoint();

  const isMobile = !screens.md;

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [searchText, setSearchText] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<
      PatientStatus | 'All'
    >('All');

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [confirmation, setConfirmation] =
    useState<ConfirmationState | null>(
      null,
    );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  /*
   * ==========================================
   * LOAD APPOINTMENTS
   * ==========================================
   */

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
          'Failed to load patients:',
          error,
        );

        message.error(
          'Unable to load appointments',
        );

        return;
      }

      const mappedPatients: Patient[] =
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
        }));

      setPatients(mappedPatients);
    } catch (error) {
      console.error(
        'Load patients error:',
        error,
      );

      message.error(
        'Unable to load appointments',
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadPatients();
  }, []);

  /*
   * ==========================================
   * STATUS UPDATE
   * ==========================================
   */

const handleStatusChange = async (
  id: string,
  status: PatientStatus,
) => {
  try {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase.functions.invoke(
      'appointment-action',
      {
        body: {
          appointmentId: id,
          status:
            status.toLowerCase(),
        },
      },
    );

    if (error) {
      console.error(
        'Appointment action error:',
        error,
      );

      message.error(
        error.message ||
          'Unable to update appointment',
      );

      return;
    }

    if (!data?.success) {
      message.error(
        data?.error ||
          'Unable to update appointment',
      );

      return;
    }

    setPatients(
      (previous) =>
        previous.map(
          (patient) =>
            patient.id === id
              ? {
                  ...patient,
                  status,
                }
              : patient,
        ),
    );

    if (
      data.notification ===
      'sent'
    ) {
      message.success(
        `Appointment ${status.toLowerCase()} and patient notified`,
      );
    } else {
      message.warning(
        `Appointment ${status.toLowerCase()}, but notification failed`,
      );
    }
  } catch (error) {
    console.error(error);

    message.error(
      'Unable to update appointment',
    );
  } finally {
    setLoading(false);
  }
};
  /*
   * ==========================================
   * CONFIRM STATUS CHANGE
   * ==========================================
   */

  const confirmStatusChange = async () => {
    if (!confirmation) {
      return;
    }

    await handleStatusChange(
      confirmation.patient.id,
      confirmation.action,
    );

    setConfirmation(null);
  };

  /*
   * ==========================================
   * FILTER PATIENTS
   * ==========================================
   */

  const filteredPatients = useMemo(() => {
    const search =
      searchText.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch =
        !search ||
        patient.name
          .toLowerCase()
          .includes(search) ||
        patient.phone
          .toLowerCase()
          .includes(search) ||
        patient.reason
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        patient.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    patients,
    searchText,
    statusFilter,
  ]);

  /*
   * ==========================================
   * STATISTICS
   * ==========================================
   */

  const statistics = useMemo(() => {
    const pending = patients.filter(
      (patient) =>
        patient.status === 'Pending',
    ).length;

    const approved = patients.filter(
      (patient) =>
        patient.status === 'Approved',
    ).length;

    const denied = patients.filter(
      (patient) =>
        patient.status === 'Denied',
    ).length;

    return {
      total: patients.length,
      pending,
      approved,
      denied,
    };
  }, [patients]);

  /*
   * ==========================================
   * STATUS TAG
   * ==========================================
   */

  const renderStatus = (
    status: PatientStatus,
  ) => {
    if (status === 'Approved') {
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          color="success"
        >
          Approved
        </Tag>
      );
    }

    if (status === 'Denied') {
      return (
        <Tag
          icon={<CloseCircleOutlined />}
          color="error"
        >
          Denied
        </Tag>
      );
    }

    return (
      <Tag
        icon={<ClockCircleOutlined />}
        color="warning"
      >
        Pending
      </Tag>
    );
  };

  /*
   * ==========================================
   * TABLE COLUMNS
   * ==========================================
   */

  const columns: ColumnsType<Patient> = [
    {
      title: 'Patient',
      key: 'patient',
      fixed: 'left',
      width: 210,
      render: (_, record) => (
        <Flex
          align="center"
          gap={10}
        >
          <Avatar
            size={42}
            icon={<UserOutlined />}
          />

          <Flex
            vertical
            style={{
              minWidth: 0,
            }}
          >
            <Text
              strong
              ellipsis
            >
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
      width: 160,
      render: (_, record) => (
        <a
          href={`tel:${record.phone}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <PhoneOutlined />
          {record.phone || '-'}
        </a>
      ),
    },

    {
      title: 'Appointment',
      key: 'appointment',
      width: 190,
      render: (_, record) => (
        <Flex
          vertical
          gap={3}
        >
          <Flex
            align="center"
            gap={6}
          >
            <CalendarOutlined />

            <Text>
              {formatAppointmentDate(
                record.appointmentDate,
              )}
            </Text>
          </Flex>

          <Flex
            align="center"
            gap={6}
          >
            <ClockCircleOutlined />

            <Text type="secondary">
              {formatAppointmentTime(
                record.appointmentTime,
              )}
            </Text>
          </Flex>
        </Flex>
      ),
    },

    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 230,
      render: (reason: string) => (
        <Text
          ellipsis={{
            tooltip: reason,
          }}
        >
          {reason || '-'}
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
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 230,
      render: (_, record) => (
        <Space
          wrap
          size={6}
        >
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              setSelectedPatient(record)
            }
          >
            View
          </Button>

          {record.status ===
            'Pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={
                  <CheckCircleOutlined />
                }
                onClick={() =>
                  setConfirmation({
                    patient: record,
                    action: 'Approved',
                  })
                }
              >
                Approve
              </Button>

              <Button
                size="small"
                danger
                icon={
                  <CloseCircleOutlined />
                }
                onClick={() =>
                  setConfirmation({
                    patient: record,
                    action: 'Denied',
                  })
                }
              >
                Deny
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  /*
   * ==========================================
   * PAGINATION
   * ==========================================
   */

  const paginatedPatients =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        pageSize;

      const end =
        start + pageSize;

      return filteredPatients.slice(
        start,
        end,
      );
    }, [
      filteredPatients,
      currentPage,
      pageSize,
    ]);

  /*
   * ==========================================
   * SEARCH / FILTER
   * ==========================================
   */

  const handleSearch = (
    value: string,
  ) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (
    value: PatientStatus | 'All',
  ) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div
      style={{
        padding: isMobile ? 12 : 24,
        width: '100%',
        minHeight: '100%',
      }}
    >
      {/* HEADER */}

      <Flex
        vertical
        gap={4}
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={isMobile ? 3 : 2}
          style={{
            margin: 0,
          }}
        >
          Appointment Dashboard
        </Title>

        <Text type="secondary">
          Manage patient appointment
          requests and confirmations.
        </Text>
      </Flex>

      {/* STATISTICS */}

      <Row
        gutter={[
          12,
          12,
        ]}
        style={{
          marginBottom: 24,
        }}
      >
        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Total Appointments"
              value={statistics.total}
              prefix={
                <CalendarOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Pending"
              value={statistics.pending}
              prefix={
                <ClockCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Approved"
              value={statistics.approved}
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Denied"
              value={statistics.denied}
              prefix={
                <CloseCircleOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* MAIN CARD */}

      <Card
        title={
          <Flex
            align="center"
            gap={8}
          >
            <CalendarOutlined />
            <span>
              Appointment Requests
            </span>
          </Flex>
        }
        extra={
          <Button
            onClick={loadPatients}
            loading={loading}
          >
            Refresh
          </Button>
        }
        styles={{
          body: {
            padding: isMobile
              ? 12
              : 20,
          },
        }}
      >
        {/* SEARCH / FILTER */}

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
            placeholder="Search patient, phone or reason..."
            value={searchText}
            onChange={(event) =>
              handleSearch(
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
            onChange={handleStatusFilter}
            style={{
              width: isMobile
                ? '100%'
                : 160,
            }}
            options={[
              {
                label: 'All Status',
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
        </Flex>

        {/* TABLE */}

        {filteredPatients.length ===
        0 ? (
          <Empty
            description={
              loading
                ? 'Loading appointments...'
                : 'No appointments found'
            }
          />
        ) : (
          <>
            <Table<Patient>
              rowKey="id"
              columns={columns}
              dataSource={
                paginatedPatients
              }
              loading={loading}
              pagination={false}
              scroll={{
                x: 1100,
              }}
              size="middle"
            />

            <Flex
              justify={
                isMobile
                  ? 'center'
                  : 'flex-end'
              }
              style={{
                marginTop: 20,
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={
                  filteredPatients.length
                }
                showSizeChanger
                pageSizeOptions={[
                  5,
                  10,
                  20,
                  50,
                ]}
                onChange={(
                  page,
                  size,
                ) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showTotal={(total) =>
                  `${total} appointments`
                }
              />
            </Flex>
          </>
        )}
      </Card>

      {/* ==========================================
          PATIENT DETAILS DRAWER
          ========================================== */}

      <Drawer
        title="Appointment Details"
        open={
          selectedPatient !== null
        }
        onClose={() =>
          setSelectedPatient(null)
        }
        width={
          isMobile
            ? '100%'
            : 480
        }
      >
        {selectedPatient && (
          <Flex
            vertical
            gap={20}
          >
            <Flex
              align="center"
              gap={14}
            >
              <Avatar
                size={64}
                icon={<UserOutlined />}
              />

              <Flex
                vertical
                gap={2}
              >
                <Title
                  level={4}
                  style={{
                    margin: 0,
                  }}
                >
                  {
                    selectedPatient.name
                  }
                </Title>

                <Text type="secondary">
                  Age{' '}
                  {
                    selectedPatient.age
                  }
                </Text>
              </Flex>
            </Flex>

            <Card
              size="small"
              title="Contact"
            >
              <Flex
                vertical
                gap={12}
              >
                <Flex
                  align="center"
                  gap={10}
                >
                  <PhoneOutlined />

                  <a
                    href={`tel:${selectedPatient.phone}`}
                  >
                    {
                      selectedPatient.phone ||
                      '-'
                    }
                  </a>
                </Flex>
              </Flex>
            </Card>

            <Card
              size="small"
              title="Appointment"
            >
              <Flex
                vertical
                gap={12}
              >
                <Flex
                  align="center"
                  gap={10}
                >
                  <CalendarOutlined />

                  <Text>
                    {
                      formatAppointmentDate(
                        selectedPatient.appointmentDate,
                      )
                    }
                  </Text>
                </Flex>

                <Flex
                  align="center"
                  gap={10}
                >
                  <ClockCircleOutlined />

                  <Text>
                    {
                      formatAppointmentTime(
                        selectedPatient.appointmentTime,
                      )
                    }
                  </Text>
                </Flex>
              </Flex>
            </Card>

            <Card
              size="small"
              title="Reason for Visit"
            >
              <Text>
                {
                  selectedPatient.reason ||
                  '-'
                }
              </Text>
            </Card>

            <Card
              size="small"
              title="Current Status"
            >
              {renderStatus(
                selectedPatient.status,
              )}
            </Card>

            {selectedPatient.status ===
              'Pending' && (
              <Flex
                gap={10}
                wrap="wrap"
              >
                <Button
                  type="primary"
                  icon={
                    <CheckCircleOutlined />
                  }
                  onClick={() => {
                    setSelectedPatient(
                      null,
                    );

                    setConfirmation({
                      patient:
                        selectedPatient,
                      action: 'Approved',
                    });
                  }}
                >
                  Approve Appointment
                </Button>

                <Button
                  danger
                  icon={
                    <CloseCircleOutlined />
                  }
                  onClick={() => {
                    setSelectedPatient(
                      null,
                    );

                    setConfirmation({
                      patient:
                        selectedPatient,
                      action: 'Denied',
                    });
                  }}
                >
                  Deny Appointment
                </Button>
              </Flex>
            )}
          </Flex>
        )}
      </Drawer>

      {/* ==========================================
          APPROVE / DENY CONFIRMATION
          ========================================== */}

      <Modal
        title={
          confirmation?.action ===
          'Approved'
            ? 'Approve Appointment'
            : 'Deny Appointment'
        }
        open={
          confirmation !== null
        }
        onCancel={() =>
          setConfirmation(null)
        }
        onOk={
          confirmStatusChange
        }
        confirmLoading={loading}
        okText={
          confirmation?.action ===
          'Approved'
            ? 'Approve'
            : 'Deny'
        }
        okButtonProps={{
          danger:
            confirmation?.action ===
            'Denied',
        }}
        centered
      >
        {confirmation && (
          <Flex
            vertical
            gap={12}
          >
            <Text>
              Are you sure you want to{' '}
              <strong>
                {confirmation.action.toLowerCase()}
              </strong>{' '}
              this appointment?
            </Text>

            <Card
              size="small"
            >
              <Flex
                vertical
                gap={6}
              >
                <Text strong>
                  {
                    confirmation
                      .patient.name
                  }
                </Text>

                <Text type="secondary">
                  {
                    confirmation
                      .patient.phone
                  }
                </Text>

                <Text type="secondary">
                  {
                    formatAppointmentDate(
                      confirmation
                        .patient
                        .appointmentDate,
                    )
                  }{' '}
                  at{' '}
                  {
                    formatAppointmentTime(
                      confirmation
                        .patient
                        .appointmentTime,
                    )
                  }
                </Text>

                <Text type="secondary">
                  {
                    confirmation
                      .patient.reason
                  }
                </Text>
              </Flex>
            </Card>

            {confirmation.action ===
              'Approved' && (
              <Text type="secondary">
                The appointment status
                will be changed to
                approved.
              </Text>
            )}

            {confirmation.action ===
              'Denied' && (
              <Text type="secondary">
                The appointment status
                will be changed to
                denied.
              </Text>
            )}
          </Flex>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;