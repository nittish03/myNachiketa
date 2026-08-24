"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://testaug.onrender.com").replace(/\/+$/, "");
const http = axios.create({ baseURL: BASE, headers: { "Content-Type": "application/json" } });
const EMPTY = { fullName: "", email: "", phone: "", role: "", shift: "", status: "Active", joiningDate: "" };
const inp = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800";
const btn = "rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-60";

async function api(method, url, data) {
  const res = method === "get" ? await http.get(url, { params: data }) : await http[method](url, data);
  if (!res.data.success) throw new Error(res.data.error || "Request failed");
  return res.data;
}

function errMsg(err, fallback) {
  return err.response?.data?.error || err.message || fallback;
}

export default function StaffManagementPage() {
  const [tab, setTab] = useState("list");
  const [filters, setFilters] = useState({ roles: [], departments: [], shifts: [], statuses: [] });
  const [staff, setStaff] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [createForm, setCreateForm] = useState(EMPTY);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [created, setCreated] = useState(null);
  const [updateForm, setUpdateForm] = useState(EMPTY);
  const [updateId, setUpdateId] = useState("");
  const [updateCode, setUpdateCode] = useState("");
  const [updateDept, setUpdateDept] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updated, setUpdated] = useState(null);
  const [deleteId, setDeleteId] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api("get", "/api/filters").then((r) => setFilters(r.data)).catch((e) => setListError(errMsg(e, "Failed to load filters")));
  }, []);

  useEffect(() => {
    setListLoading(true);
    setListError("");
    api("get", "/api/staff", { q: search, role: roleFilter, department: deptFilter, shift: shiftFilter, status: statusFilter, page, limit: 10 })
      .then((r) => { setStaff(r.data); setMeta(r.meta); })
      .catch((e) => { setListError(errMsg(e, "Failed to load staff")); setStaff([]); })
      .finally(() => setListLoading(false));
  }, [search, roleFilter, deptFilter, shiftFilter, statusFilter, page, refresh]);

  function loadEdit(m) {
    setUpdateId(m.id);
    setUpdateCode(m.employeeCode || "");
    setUpdateDept(m.department || "");
    setLookupEmail(m.email);
    setUpdateForm({ fullName: m.fullName || "", email: m.email || "", phone: m.phone || "", role: m.role || "", shift: m.shift || "", status: m.status || "Active", joiningDate: m.joiningDate || "" });
    setUpdateError("");
    setUpdated(null);
    setTab("update");
  }

  function clearUpdate() {
    setUpdateForm(EMPTY);
    setUpdateId("");
    setUpdateCode("");
    setUpdateDept("");
    setLookupEmail("");
    setUpdateError("");
    setUpdated(null);
  }

  async function onCreate(e) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setCreated(null);
    try {
      const r = await api("post", "/api/staff", createForm);
      setCreated(r.data);
      setCreateForm(EMPTY);
      setRefresh((n) => n + 1);
    } catch (e) {
      setCreateError(errMsg(e, "Failed to create staff"));
    } finally {
      setCreateLoading(false);
    }
  }

  async function onLookup(e) {
    e.preventDefault();
    if (!lookupEmail.trim()) return setUpdateError("Enter an email to search");
    setUpdateLoading(true);
    setUpdateError("");
    setUpdated(null);
    try {
      const r = await api("get", "/api/staff", { q: lookupEmail.trim(), limit: 1 });
      if (!r.data.length) return setUpdateError("No staff found with that email");
      loadEdit(r.data[0]);
    } catch (e) {
      setUpdateError(errMsg(e, "Failed to find staff"));
    } finally {
      setUpdateLoading(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!updateId) return setUpdateError("Load a staff member first");
    setUpdateLoading(true);
    setUpdateError("");
    setUpdated(null);
    try {
      const r = await api("put", `/api/staff/${updateId}`, updateForm);
      setUpdated(r.data);
      setUpdateCode(r.data.employeeCode || "");
      setUpdateDept(r.data.department || "");
      setRefresh((n) => n + 1);
    } catch (e) {
      setUpdateError(errMsg(e, "Failed to update staff"));
    } finally {
      setUpdateLoading(false);
    }
  }

  async function onDelete(m) {
    if (!window.confirm(`Delete ${m.fullName} (${m.email})?`)) return;
    setDeleteId(m.id);
    setListError("");
    try {
      await api("delete", `/api/staff/${m.id}`);
      if (updateId === m.id) clearUpdate();
      setRefresh((n) => n + 1);
    } catch (e) {
      setListError(errMsg(e, "Failed to delete staff"));
    } finally {
      setDeleteId("");
    }
  }

  function fields(form, setForm) {
    return (
      <>
        {[["Full name", "fullName", "text"], ["Email", "email", "email"], ["Phone", "phone", "text"], ["Joining date", "joiningDate", "date"]].map(([label, key, type]) => (
          <label key={key} className="flex flex-col gap-1 text-xs font-semibold">
            {label}
            <input className={inp} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />
          </label>
        ))}
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Role
          <select className={inp} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
            <option value="">Select role</option>
            {filters.roles.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Shift
          <select className={inp} value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} required>
            <option value="">Select shift</option>
            {filters.shifts.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Status
          <select className={inp} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
            {filters.statuses.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </>
    );
  }

  const filterSelect = (value, setValue, label, options) => (
    <select className={`${inp} min-w-[140px] flex-1`} value={value} onChange={(e) => { setValue(e.target.value); setPage(1); }}>
      <option value="">{label}</option>
      {options.map((v) => <option key={v} value={v}>{v}</option>)}
    </select>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Hotel Staff Management</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {[["list", "Staff list"], ["create", "Add staff"], ["update", "Update staff"]].map(([k, label]) => (
          <button key={k} type="button" className={`${btn} border ${tab === k ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
          <div className="mb-4 flex flex-wrap gap-2">
            <input className={`${inp} min-w-[200px] flex-1`} type="search" placeholder="Search name, email, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            {filterSelect(roleFilter, setRoleFilter, "All roles", filters.roles)}
            {filterSelect(deptFilter, setDeptFilter, "All departments", filters.departments)}
            {filterSelect(shiftFilter, setShiftFilter, "All shifts", filters.shifts)}
            {filterSelect(statusFilter, setStatusFilter, "All statuses", filters.statuses)}
          </div>

          {listError && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{listError}</p>}
          {listLoading ? <p className="py-8 text-center text-slate-500">Loading staff...</p> : staff.length === 0 ? <p className="py-8 text-center text-slate-500">No staff found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900">
                    {["Name", "Email", "Phone", "Role", "Department", "Shift", "Status", "Joining", "Actions"].map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="whitespace-nowrap px-3 py-2">{m.fullName}</td>
                      <td className="whitespace-nowrap px-3 py-2">{m.email}</td>
                      <td className="whitespace-nowrap px-3 py-2">{m.phone}</td>
                      <td className="whitespace-nowrap px-3 py-2">{m.role}</td>
                      <td className="whitespace-nowrap px-3 py-2">{m.department}</td>
                      <td className="whitespace-nowrap px-3 py-2">{m.shift}</td>
                      <td className="whitespace-nowrap px-3 py-2">{m.status}</td>
                      <td className="whitespace-nowrap px-3 py-2">{m.joiningDate}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <div className="flex gap-1">
                          <button type="button" className={`${btn} border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700`} onClick={() => loadEdit(m)}>Edit</button>
                          <button type="button" className={`${btn} border border-red-200 bg-red-50 text-red-700`} disabled={deleteId === m.id} onClick={() => onDelete(m)}>{deleteId === m.id ? "Deleting..." : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!listLoading && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <button type="button" className={`${btn} border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700`} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
              <button type="button" className={`${btn} border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700`} disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </section>
      )}

      {tab === "create" && (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold">Add new staff</h2>
          {createError && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</p>}
          {created && <p className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">Created: {created.fullName} ({created.employeeCode}) — {created.email}</p>}
          <form className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4" onSubmit={onCreate}>
            {fields(createForm, setCreateForm)}
            <div className="col-span-full flex gap-2">
              <button type="submit" className={`${btn} bg-teal-700 px-5 text-white`} disabled={createLoading}>{createLoading ? "Creating..." : "Create staff"}</button>
              <button type="button" className={`${btn} border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700`} onClick={() => { setCreateForm(EMPTY); setCreateError(""); setCreated(null); }}>Reset</button>
            </div>
          </form>
        </section>
      )}

      {tab === "update" && (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold">Update staff</h2>
          <form className="mb-2 flex flex-wrap gap-2" onSubmit={onLookup}>
            <input className={`${inp} min-w-[240px] flex-1`} type="email" placeholder="Find by email" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} />
            <button type="submit" className={`${btn} border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700`} disabled={updateLoading}>{updateLoading && !updateId ? "Searching..." : "Find"}</button>
          </form>
          {updateId && <p className="mb-3 text-sm text-slate-500">Editing {updateCode}{updateDept ? ` · ${updateDept}` : ""}</p>}
          {updateError && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{updateError}</p>}
          {updated && <p className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">Updated: {updated.fullName} — {updated.email}</p>}
          <form className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4" onSubmit={onUpdate}>
            {fields(updateForm, setUpdateForm)}
            <div className="col-span-full flex gap-2">
              <button type="submit" className={`${btn} bg-teal-700 px-5 text-white`} disabled={updateLoading || !updateId}>{updateLoading && updateId ? "Updating..." : "Update staff"}</button>
              <button type="button" className={`${btn} border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700`} onClick={clearUpdate}>Clear</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
