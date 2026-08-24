"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createStaff,
  deleteStaff,
  getFilters,
  getStaff,
  updateStaff,
} from "@/lib/api";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  shift: "",
  status: "Active",
  joiningDate: "",
};

const EMPTY_FILTERS = {
  roles: [],
  departments: [],
  shifts: [],
  statuses: [],
};

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [staff, setStaff] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdStaff, setCreatedStaff] = useState(null);

  const [updateForm, setUpdateForm] = useState(EMPTY_FORM);
  const [updateId, setUpdateId] = useState("");
  const [updateEmployeeCode, setUpdateEmployeeCode] = useState("");
  const [updateDepartment, setUpdateDepartment] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updatedStaff, setUpdatedStaff] = useState(null);

  const [deleteLoadingId, setDeleteLoadingId] = useState("");

  const loadFilters = useCallback(async () => {
    try {
      const res = await getFilters();
      setFilters(res.data);
    } catch (err) {
      setListError(err.message || "Failed to load filters");
    }
  }, []);

  const loadStaff = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await getStaff({
        q: search,
        role: roleFilter,
        department: departmentFilter,
        shift: shiftFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      setStaff(res.data);
      setMeta(res.meta);
    } catch (err) {
      setListError(err.message || "Failed to load staff");
      setStaff([]);
    } finally {
      setListLoading(false);
    }
  }, [search, roleFilter, departmentFilter, shiftFilter, statusFilter, page]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  function resetCreateForm() {
    setCreateForm(EMPTY_FORM);
    setCreateError("");
    setCreatedStaff(null);
  }

  function resetUpdateForm() {
    setUpdateForm(EMPTY_FORM);
    setUpdateId("");
    setUpdateEmployeeCode("");
    setUpdateDepartment("");
    setLookupEmail("");
    setUpdateError("");
    setUpdatedStaff(null);
  }

  function startEdit(staffMember) {
    setUpdateId(staffMember.id);
    setUpdateEmployeeCode(staffMember.employeeCode || "");
    setUpdateDepartment(staffMember.department || "");
    setLookupEmail(staffMember.email);
    setUpdateForm({
      fullName: staffMember.fullName || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      role: staffMember.role || "",
      shift: staffMember.shift || "",
      status: staffMember.status || "Active",
      joiningDate: staffMember.joiningDate || "",
    });
    setUpdateError("");
    setUpdatedStaff(null);
    setActiveTab("update");
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setCreatedStaff(null);
    try {
      const res = await createStaff(createForm);
      setCreatedStaff(res.data);
      setCreateForm(EMPTY_FORM);
      await loadStaff();
    } catch (err) {
      setCreateError(err.message || "Failed to create staff");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleLookupByEmail(e) {
    e.preventDefault();
    if (!lookupEmail.trim()) {
      setUpdateError("Enter an email to search");
      return;
    }
    setUpdateLoading(true);
    setUpdateError("");
    setUpdatedStaff(null);
    try {
      const res = await getStaff({ q: lookupEmail.trim(), limit: 1 });
      if (!res.data.length) {
        setUpdateError("No staff found with that email");
        return;
      }
      startEdit(res.data[0]);
    } catch (err) {
      setUpdateError(err.message || "Failed to find staff");
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!updateId) {
      setUpdateError("Load a staff member first");
      return;
    }
    setUpdateLoading(true);
    setUpdateError("");
    setUpdatedStaff(null);
    try {
      const res = await updateStaff(updateId, updateForm);
      setUpdatedStaff(res.data);
      setUpdateEmployeeCode(res.data.employeeCode || "");
      setUpdateDepartment(res.data.department || "");
      await loadStaff();
    } catch (err) {
      setUpdateError(err.message || "Failed to update staff");
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleDelete(staffMember) {
    const confirmed = window.confirm(
      `Delete ${staffMember.fullName} (${staffMember.email})?`
    );
    if (!confirmed) return;

    setDeleteLoadingId(staffMember.id);
    setListError("");
    try {
      await deleteStaff(staffMember.id);
      if (updateId === staffMember.id) {
        resetUpdateForm();
      }
      await loadStaff();
    } catch (err) {
      setListError(err.message || "Failed to delete staff");
    } finally {
      setDeleteLoadingId("");
    }
  }

  function renderFormFields(form, setForm, idPrefix) {
    return (
      <>
        <label className="staff-label">
          Full name
          <input
            className="auth-input"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </label>
        <label className="staff-label">
          Email
          <input
            className="auth-input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label className="staff-label">
          Phone
          <input
            className="auth-input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </label>
        <label className="staff-label">
          Role
          <select
            className="auth-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          >
            <option value="">Select role</option>
            {filters.roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label className="staff-label">
          Shift
          <select
            className="auth-input"
            value={form.shift}
            onChange={(e) => setForm({ ...form, shift: e.target.value })}
            required
          >
            <option value="">Select shift</option>
            {filters.shifts.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </label>
        <label className="staff-label">
          Status
          <select
            className="auth-input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            required
          >
            {filters.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="staff-label">
          Joining date
          <input
            className="auth-input"
            type="date"
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
            required
          />
        </label>
      </>
    );
  }

  return (
    <div className="staff-page">
      <header className="staff-header">
        <h1>Hotel Staff Management</h1>
        <p>Create, view, update, and delete hotel staff records.</p>
      </header>

      <nav className="staff-tabs">
        {[
          ["list", "Staff list"],
          ["create", "Add staff"],
          ["update", "Update staff"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`staff-tab${activeTab === key ? " staff-tab-active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "list" && (
        <section className="staff-section">
          <div className="staff-toolbar">
            <input
              className="auth-input staff-search"
              type="search"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="auth-input staff-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              {filters.roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              className="auth-input staff-filter"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All departments</option>
              {filters.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              className="auth-input staff-filter"
              value={shiftFilter}
              onChange={(e) => {
                setShiftFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All shifts</option>
              {filters.shifts.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
            <select
              className="auth-input staff-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {filters.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {listError && <p className="staff-error">{listError}</p>}

          {listLoading ? (
            <p className="staff-message">Loading staff...</p>
          ) : staff.length === 0 ? (
            <p className="staff-message">No staff found.</p>
          ) : (
            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th>Joining date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td>{member.fullName}</td>
                      <td>{member.email}</td>
                      <td>{member.phone}</td>
                      <td>{member.role}</td>
                      <td>{member.department}</td>
                      <td>{member.shift}</td>
                      <td>{member.status}</td>
                      <td>{member.joiningDate}</td>
                      <td className="staff-actions">
                        <button
                          type="button"
                          className="staff-btn staff-btn-secondary"
                          onClick={() => startEdit(member)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="staff-btn staff-btn-danger"
                          disabled={deleteLoadingId === member.id}
                          onClick={() => handleDelete(member)}
                        >
                          {deleteLoadingId === member.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!listLoading && meta.totalPages > 1 && (
            <div className="staff-pagination">
              <button
                type="button"
                className="staff-btn staff-btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <button
                type="button"
                className="staff-btn staff-btn-secondary"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "create" && (
        <section className="staff-section">
          <h2>Add new staff</h2>
          {createError && <p className="staff-error">{createError}</p>}
          {createdStaff && (
            <div className="staff-success">
              <strong>Staff created:</strong> {createdStaff.fullName} (
              {createdStaff.employeeCode}) — {createdStaff.email}
            </div>
          )}
          <form className="staff-form" onSubmit={handleCreate}>
            {renderFormFields(createForm, setCreateForm, "create")}
            <div className="staff-form-actions">
              <button type="submit" className="auth-submit staff-submit" disabled={createLoading}>
                {createLoading ? "Creating..." : "Create staff"}
              </button>
              <button type="button" className="staff-btn staff-btn-secondary" onClick={resetCreateForm}>
                Reset
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "update" && (
        <section className="staff-section">
          <h2>Update staff</h2>
          <form className="staff-lookup" onSubmit={handleLookupByEmail}>
            <input
              className="auth-input"
              type="email"
              placeholder="Find by email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
            />
            <button type="submit" className="staff-btn staff-btn-secondary" disabled={updateLoading}>
              {updateLoading && !updateId ? "Searching..." : "Find"}
            </button>
          </form>

          {updateId && (
            <p className="staff-meta">
              Editing {updateEmployeeCode}
              {updateDepartment ? ` · ${updateDepartment}` : ""}
            </p>
          )}

          {updateError && <p className="staff-error">{updateError}</p>}
          {updatedStaff && (
            <div className="staff-success">
              <strong>Staff updated:</strong> {updatedStaff.fullName} — {updatedStaff.email}
            </div>
          )}

          <form className="staff-form" onSubmit={handleUpdate}>
            {renderFormFields(updateForm, setUpdateForm, "update")}
            <div className="staff-form-actions">
              <button
                type="submit"
                className="auth-submit staff-submit"
                disabled={updateLoading || !updateId}
              >
                {updateLoading && updateId ? "Updating..." : "Update staff"}
              </button>
              <button type="button" className="staff-btn staff-btn-secondary" onClick={resetUpdateForm}>
                Clear
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
