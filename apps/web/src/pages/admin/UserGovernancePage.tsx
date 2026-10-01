import React, { useState, useEffect } from 'react';
import { adminService, UserRecord } from '@/services/adminService';
import { departmentService, DepartmentInfo } from '@/services/departmentService';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminTable,
  AdminDrawer,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from '@/components/admin/primitives';
import {
  LuUsers,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuCircleX,
  LuShield,
  LuRotateCcw,
  LuMail,
  LuBuilding2,
  LuCalendar,
  LuIdCard,
  LuClock,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function UserGovernancePage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and pagination state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // User inspection drawer
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const fetchDepartments = async () => {
    try {
      const depts = await departmentService.getDepartments();
      setDepartments(depts);
    } catch {
      // non-fatal
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        active: statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
        departmentId: deptFilter !== 'ALL' ? deptFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit: 12,
      });
      const usersList = Array.isArray(res?.users) ? res.users : Array.isArray(res) ? (res as any) : [];
      setUsers(usersList);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotalRecords(res?.pagination?.total || usersList.length);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to query users from backend database.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, deptFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
        return 'danger';
      case 'DEPARTMENT_MANAGER':
        return 'primary';
      case 'FIELD_OFFICER':
        return 'warning';
      default:
        return 'info';
    }
  };

  const columns = [
    {
      header: 'User Identity',
      cell: (u: UserRecord) => (
        <div className="space-y-0.5">
          <span className="font-bold text-[#F8FAFC] text-sm font-heading block">
            {u.name}
          </span>
          <span className="text-[11px] text-[#94A3B8] font-mono block">
            {u.email}
          </span>
        </div>
      ),
    },
    {
      header: 'Role & RBAC Tier',
      cell: (u: UserRecord) => (
        <AdminBadge size="sm" variant={getRoleBadgeVariant(u.role)}>
          {u.role.replace('_', ' ')}
        </AdminBadge>
      ),
    },
    {
      header: 'Department / Unit',
      cell: (u: UserRecord) => (
        <span className="text-xs text-[#94A3B8]">
          {u.departmentId?.name || u.teamId?.name || 'Municipal Operations Core'}
        </span>
      ),
    },
    {
      header: 'Badge / ID',
      cell: (u: UserRecord) => (
        <span className="font-mono text-xs text-[#818CF8]">
          {u.badgeNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (u: UserRecord) => (
        <AdminBadge size="sm" variant={u.isActive ? 'success' : 'outline'} dot={u.isActive}>
          {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
        </AdminBadge>
      ),
    },
    {
      header: 'Registered',
      cell: (u: UserRecord) => (
        <span className="text-[11px] text-[#64748B] font-mono">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="User Governance & RBAC"
        description="Audit accounts, inspect jurisdictional roles, and govern permissions for citizens, field responders, and platform operators."
        tag="GOVERNANCE"
        actions={
          <button
            type="button"
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <AdminCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <LuSearch className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, badge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Roles</option>
            <option value="CITIZEN">Citizens</option>
            <option value="FIELD_OFFICER">Field Officers</option>
            <option value="DEPARTMENT_MANAGER">Department Managers</option>
            <option value="PLATFORM_ADMIN">Platform Admins</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Suspended</option>
          </select>
        </div>
      </AdminCard>

      {/* Users Table */}
      {error ? (
        <AdminErrorState
          title="Unable to Query Users"
          reason={error}
          onRetry={fetchUsers}
        />
      ) : (
        <AdminTable
          columns={columns}
          data={users}
          keyExtractor={(u) => u._id}
          onRowClick={(u) => setSelectedUser(u)}
          isLoading={loading}
          emptyMessage="No users match the specified search or filter criteria."
          pagination={{
            currentPage: page,
            totalPages,
            totalRecords,
            pageSize: 12,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      )}

      {/* USER INSPECTION DRAWER */}
      {selectedUser && (
        <AdminDrawer
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={selectedUser.name}
          subtitle={`Account ID: ${selectedUser._id}`}
          badge={selectedUser.role}
        >
          <div className="space-y-6 text-xs font-sans">
            {/* Identity Card */}
            <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.12)] space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] block">
                Account Credentials & Role
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <LuMail className="w-3.5 h-3.5" />
                    Email
                  </span>
                  <span className="text-[#F8FAFC] font-mono select-all">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <LuShield className="w-3.5 h-3.5" />
                    Role Tier
                  </span>
                  <AdminBadge size="sm" variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role}
                  </AdminBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <LuIdCard className="w-3.5 h-3.5" />
                    Badge / Unit ID
                  </span>
                  <span className="font-mono text-[#818CF8]">
                    {selectedUser.badgeNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <LuBuilding2 className="w-3.5 h-3.5" />
                    Department
                  </span>
                  <span className="text-[#F8FAFC]">
                    {selectedUser.departmentId?.name || 'All Municipal Wards'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <LuCalendar className="w-3.5 h-3.5" />
                    Registered On
                  </span>
                  <span className="text-[#F8FAFC]">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Scope Privileges per Role */}
            <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.12)] space-y-2.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] block">
                Enforced RBAC Scopes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.role === 'PLATFORM_ADMIN' ? (
                  ['cluster:all', 'agents:all', 'policies:write', 'rbac:admin'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#13243A] text-rose-300 font-mono text-[10.5px]">
                      {s}
                    </span>
                  ))
                ) : selectedUser.role === 'DEPARTMENT_MANAGER' ? (
                  ['incidents:write', 'dispatch:all', 'teams:manage', 'analytics:read'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#13243A] text-indigo-300 font-mono text-[10.5px]">
                      {s}
                    </span>
                  ))
                ) : selectedUser.role === 'FIELD_OFFICER' ? (
                  ['inspection:write', 'work_order:execute', 'evidence:upload'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#13243A] text-amber-300 font-mono text-[10.5px]">
                      {s}
                    </span>
                  ))
                ) : (
                  ['report:create', 'incidents:read:mine', 'evidence:view'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#13243A] text-blue-300 font-mono text-[10.5px]">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </AdminDrawer>
      )}
    </div>
  );
}
export default UserGovernancePage;
