"use client";
import {
 FormEvent,
 useCallback,
 useEffect,
 useMemo,
 useState,
} from "react";
import {
 AlertCircle,
 CheckCircle2,
 Edit3,
 Loader2,
 Plus,
 RefreshCw,
 Search,
 Shield,
 ShieldCheck,
 Trash2,
 UserCheck,
 UserRound,
 UserX,
 Users,
 X,
} from "lucide-react";
type Role =
 | "ADMIN"
 | "OPERATOR"
 | "VIEWER";
type UserItem = {
 id: number;
 name: string;
 email: string;
 role: Role;
 active: boolean;
 lastLoginAt: string | null;
 createdAt: string;
 updatedAt: string;
};
type FormState = {
 name: string;
 email: string;
 password: string;
 role: Role;
 active: boolean;
};
const EMPTY_FORM: FormState = {
 name: "",
 email: "",
 password: "",
 role: "VIEWER",
 active: true,
};
function formatDate(
 value: string | null
) {
 if (!value) {
   return "Never";
 }
 return new Date(
   value
 ).toLocaleString();
}
function roleClasses(
 role: Role
) {
 if (role === "ADMIN") {
   return "bg-purple-50 text-purple-700 border-purple-200";
 }
 if (
   role === "OPERATOR"
 ) {
   return "bg-blue-50 text-blue-700 border-blue-200";
 }
 return "bg-slate-50 text-slate-600 border-slate-200";
}
export default function UsersClient({
 currentUserId,
}: {
 currentUserId: string;
}) {
 const [users, setUsers] =
   useState<UserItem[]>([]);
 const [loading, setLoading] =
   useState(true);
 const [
   refreshing,
   setRefreshing,
 ] = useState(false);
 const [saving, setSaving] =
   useState(false);
 const [
   deletingId,
   setDeletingId,
 ] =
   useState<number | null>(
     null
   );
 const [search, setSearch] =
   useState("");
 const [
   modalOpen,
   setModalOpen,
 ] = useState(false);
 const [
   editingUser,
   setEditingUser,
 ] =
   useState<UserItem | null>(
     null
   );
 const [form, setForm] =
   useState<FormState>(
     EMPTY_FORM
   );
 const [error, setError] =
   useState<string | null>(
     null
   );
 const [
   success,
   setSuccess,
 ] =
   useState<string | null>(
     null
   );
 const loadUsers =
   useCallback(
     async (
       manual = false
     ) => {
       if (manual) {
         setRefreshing(true);
       }
       try {
         const response =
           await fetch(
             "/api/users",
             {
               cache:
                 "no-store",
             }
           );
         const data =
           await response.json();
         if (
           !response.ok ||
           !data.ok
         ) {
           throw new Error(
             data.error ||
               "Unable to load users."
           );
         }
         setUsers(
           data.users
         );
         setError(null);
       } catch (error) {
         setError(
           error instanceof Error
             ? error.message
             : "Unable to load users."
         );
       } finally {
         setLoading(false);
         setRefreshing(
           false
         );
       }
     },
     []
   );
 useEffect(() => {
   void loadUsers();
 }, [loadUsers]);
 const filteredUsers =
   useMemo(() => {
     const query =
       search
         .trim()
         .toLowerCase();
     if (!query) {
       return users;
     }
     return users.filter(
       (user) =>
         user.name
           .toLowerCase()
           .includes(query) ||
         user.email
           .toLowerCase()
           .includes(query) ||
         user.role
           .toLowerCase()
           .includes(query)
     );
   }, [users, search]);
 const activeCount =
   users.filter(
     (user) => user.active
   ).length;
 const adminCount =
   users.filter(
     (user) =>
       user.role ===
       "ADMIN"
   ).length;
 const operatorCount =
   users.filter(
     (user) =>
       user.role ===
       "OPERATOR"
   ).length;
 function openCreate() {
   setEditingUser(null);
   setForm(EMPTY_FORM);
   setError(null);
   setSuccess(null);
   setModalOpen(true);
 }
 function openEdit(
   user: UserItem
 ) {
   setEditingUser(user);
   setForm({
     name: user.name,
     email: user.email,
     password: "",
     role: user.role,
     active: user.active,
   });
   setError(null);
   setSuccess(null);
   setModalOpen(true);
 }
 function closeModal() {
   if (saving) {
     return;
   }
   setModalOpen(false);
   setEditingUser(null);
   setForm(EMPTY_FORM);
 }
 async function handleSubmit(
   event: FormEvent<HTMLFormElement>
 ) {
   event.preventDefault();
   setSaving(true);
   setError(null);
   setSuccess(null);
   try {
     const editing =
       Boolean(
         editingUser
       );
     const url = editing
       ? `/api/users/${editingUser!.id}`
       : "/api/users";
     const payload: Record<
       string,
       unknown
> = {
       name:
         form.name.trim(),
       email:
         form.email
           .trim()
           .toLowerCase(),
       role: form.role,
     };
     if (editing) {
       payload.active =
         form.active;
       if (form.password) {
         payload.password =
           form.password;
       }
     } else {
       payload.password =
         form.password;
     }
     const response =
       await fetch(url, {
         method: editing
           ? "PUT"
           : "POST",
         headers: {
           "Content-Type":
             "application/json",
         },
         body: JSON.stringify(
           payload
         ),
       });
     const data =
       await response.json();
     if (
       !response.ok ||
       !data.ok
     ) {
       throw new Error(
         data.error ||
           "Unable to save user."
       );
     }
     setSuccess(
       editing
         ? "User updated successfully."
         : "User created successfully."
     );
     setModalOpen(false);
     setEditingUser(null);
     setForm(EMPTY_FORM);
     await loadUsers();
   } catch (error) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to save user."
     );
   } finally {
     setSaving(false);
   }
 }
 async function toggleUser(
   user: UserItem
 ) {
   if (
     String(user.id) ===
     currentUserId
   ) {
     setError(
       "You cannot disable your own account."
     );
     return;
   }
   setError(null);
   setSuccess(null);
   try {
     const response =
       await fetch(
         `/api/users/${user.id}`,
         {
           method: "PUT",
           headers: {
             "Content-Type":
               "application/json",
           },
           body: JSON.stringify({
             active:
               !user.active,
           }),
         }
       );
     const data =
       await response.json();
     if (
       !response.ok ||
       !data.ok
     ) {
       throw new Error(
         data.error ||
           "Unable to update user."
       );
     }
     setSuccess(
       user.active
         ? "User disabled."
         : "User enabled."
     );
     await loadUsers();
   } catch (error) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to update user."
     );
   }
 }
 async function deleteUser(
   user: UserItem
 ) {
   if (
     String(user.id) ===
     currentUserId
   ) {
     setError(
       "You cannot delete your own account."
     );
     return;
   }
   const confirmed =
     window.confirm(
       `Delete ${user.name}?\n\nThis action cannot be undone.`
     );
   if (!confirmed) {
     return;
   }
   setDeletingId(
user.id
   );
   setError(null);
   setSuccess(null);
   try {
     const response =
       await fetch(
         `/api/users/${user.id}`,
         {
           method:
             "DELETE",
         }
       );
     const data =
       await response.json();
     if (
       !response.ok ||
       !data.ok
     ) {
       throw new Error(
         data.error ||
           "Unable to delete user."
       );
     }
     setSuccess(
       "User deleted successfully."
     );
     await loadUsers();
   } catch (error) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to delete user."
     );
   } finally {
     setDeletingId(
       null
     );
   }
 }
 return (
<>
<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
<div>
<div className="flex items-center gap-3">
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
<Users
               size={22}
             />
</div>
<div>
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
               Users
</h1>
<p className="mt-1 text-sm text-slate-500">
               Manage platform access and operator roles.
</p>
</div>
</div>
</div>
<div className="flex gap-2">
<button
           type="button"
           onClick={() =>
             void loadUsers(
               true
             )
           }
           disabled={
             refreshing
           }
           className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
>
<RefreshCw
             size={16}
             className={
               refreshing
                 ? "animate-spin"
                 : ""
             }
           />
           Refresh
</button>
<button
           type="button"
           onClick={
             openCreate
           }
           className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
>
<Plus size={17} />
           Add User
</button>
</div>
</div>
     {error && (
<div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
<AlertCircle
           size={18}
         />
         {error}
</div>
     )}
     {success && (
<div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
<CheckCircle2
           size={18}
         />
         {success}
</div>
     )}
<section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<UserRound className="text-blue-600" size={20} />
<p className="mt-4 text-2xl font-bold text-slate-900">
           {users.length}
</p>
<p className="text-xs text-slate-500">
           Total Users
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<UserCheck className="text-emerald-600" size={20} />
<p className="mt-4 text-2xl font-bold text-slate-900">
           {activeCount}
</p>
<p className="text-xs text-slate-500">
           Active
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<ShieldCheck className="text-purple-600" size={20} />
<p className="mt-4 text-2xl font-bold text-slate-900">
           {adminCount}
</p>
<p className="text-xs text-slate-500">
           Administrators
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<Shield className="text-blue-600" size={20} />
<p className="mt-4 text-2xl font-bold text-slate-900">
           {operatorCount}
</p>
<p className="text-xs text-slate-500">
           Operators
</p>
</div>
</section>
<section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="border-b border-slate-100 p-4">
<div className="relative max-w-md">
<Search
             size={17}
             className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
           />
<input
             value={search}
             onChange={(event) =>
               setSearch(
                 event.target.value
               )
             }
             placeholder="Search users..."
             className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
           />
</div>
</div>
       {loading ? (
<div className="flex min-h-64 items-center justify-center">
<Loader2 className="animate-spin text-blue-600" />
</div>
       ) : (
<div className="overflow-x-auto">
<table className="w-full min-w-[900px]">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-5 py-3">
                   User
</th>
<th className="px-5 py-3">
                   Role
</th>
<th className="px-5 py-3">
                   Status
</th>
<th className="px-5 py-3">
                   Last Login
</th>
<th className="px-5 py-3">
                   Created
</th>
<th className="px-5 py-3 text-right">
                   Actions
</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
               {filteredUsers.map(
                 (user) => {
                   const isSelf =
                     String(
user.id
                     ) ===
                     currentUserId;
                   return (
<tr
                       key={
user.id
                       }
                       className="hover:bg-slate-50/70"
>
<td className="px-5 py-4">
<div className="flex items-center gap-3">
<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                             {user.name
                               .slice(
                                 0,
                                 1
                               )
                               .toUpperCase()}
</div>
<div>
<div className="flex items-center gap-2">
<p className="text-sm font-semibold text-slate-900">
                                 {
                                   user.name
                                 }
</p>
                               {isSelf && (
<span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                   YOU
</span>
                               )}
</div>
<p className="mt-0.5 text-xs text-slate-500">
                               {
                                 user.email
                               }
</p>
</div>
</div>
</td>
<td className="px-5 py-4">
<span
                           className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${roleClasses(
                             user.role
                           )}`}
>
                           {
                             user.role
                           }
</span>
</td>
<td className="px-5 py-4">
<span
                           className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                             user.active
                               ? "text-emerald-600"
                               : "text-red-500"
                           }`}
>
<span
                             className={`h-2 w-2 rounded-full ${
                               user.active
                                 ? "bg-emerald-500"
                                 : "bg-red-500"
                             }`}
                           />
                           {user.active
                             ? "Active"
                             : "Disabled"}
</span>
</td>
<td className="px-5 py-4 text-xs text-slate-500">
                         {formatDate(
                           user.lastLoginAt
                         )}
</td>
<td className="px-5 py-4 text-xs text-slate-500">
                         {formatDate(
                           user.createdAt
                         )}
</td>
<td className="px-5 py-4">
<div className="flex justify-end gap-1">
<button
                             type="button"
                             title="Edit user"
                             onClick={() =>
                               openEdit(
                                 user
                               )
                             }
                             className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
>
<Edit3 size={16} />
</button>
<button
                             type="button"
                             disabled={
                               isSelf
                             }
                             title={
                               user.active
                                 ? "Disable user"
                                 : "Enable user"
                             }
                             onClick={() =>
                               void toggleUser(
                                 user
                               )
                             }
                             className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-30"
>
                             {user.active ? (
<UserX size={16} />
                             ) : (
<UserCheck size={16} />
                             )}
</button>
<button
                             type="button"
                             disabled={
                               isSelf ||
                               deletingId ===
user.id
                             }
                             title="Delete user"
                             onClick={() =>
                               void deleteUser(
                                 user
                               )
                             }
                             className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
>
                             {deletingId ===
user.id ? (
<Loader2
                                 size={16}
                                 className="animate-spin"
                               />
                             ) : (
<Trash2 size={16} />
                             )}
</button>
</div>
</td>
</tr>
                   );
                 }
               )}
</tbody>
</table>
</div>
       )}
</section>
     {modalOpen && (
<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
<div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
<div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
<div>
<h2 className="text-lg font-bold text-slate-900">
                 {editingUser
                   ? "Edit User"
                   : "Add User"}
</h2>
<p className="mt-1 text-xs text-slate-500">
                 {editingUser
                   ? "Update account details and access."
                   : "Create a new platform account."}
</p>
</div>
<button
               type="button"
               onClick={
                 closeModal
               }
               className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
>
<X size={18} />
</button>
</div>
<form
             onSubmit={
               handleSubmit
             }
             className="space-y-5 p-6"
>
<div>
<label className="mb-2 block text-sm font-medium text-slate-700">
                 Name
</label>
<input
                 required
                 value={
                   form.name
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       name: event
                         .target
                         .value,
                     })
                   )
                 }
                 className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
               />
</div>
<div>
<label className="mb-2 block text-sm font-medium text-slate-700">
                 Email
</label>
<input
                 required
                 type="email"
                 value={
                   form.email
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       email:
                         event
                           .target
                           .value,
                     })
                   )
                 }
                 className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
               />
</div>
<div>
<label className="mb-2 block text-sm font-medium text-slate-700">
                 Password
</label>
<input
                 type="password"
                 required={
                   !editingUser
                 }
                 minLength={8}
                 value={
                   form.password
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       password:
                         event
                           .target
                           .value,
                     })
                   )
                 }
                 placeholder={
                   editingUser
                     ? "Leave blank to keep current password"
                     : "Minimum 8 characters"
                 }
                 className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
               />
</div>
<div>
<label className="mb-2 block text-sm font-medium text-slate-700">
                 Role
</label>
<select
                 value={
                   form.role
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       role: event
                         .target
                         .value as Role,
                     })
                   )
                 }
                 className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-blue-500"
>
<option value="ADMIN">
                   Administrator
</option>
<option value="OPERATOR">
                   Operator
</option>
<option value="VIEWER">
                   Viewer
</option>
</select>
</div>
             {editingUser && (
<label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
<div>
<p className="text-sm font-medium text-slate-800">
                     Account Active
</p>
<p className="mt-1 text-xs text-slate-500">
                     Disabled users cannot sign in.
</p>
</div>
<input
                   type="checkbox"
                   checked={
                     form.active
                   }
                   disabled={
                     String(
editingUser.id
                     ) ===
                     currentUserId
                   }
                   onChange={(
                     event
                   ) =>
                     setForm(
                       (
                         current
                       ) => ({
                         ...current,
                         active:
                           event
                             .target
                             .checked,
                       })
                     )
                   }
                   className="h-4 w-4"
                 />
</label>
             )}
<div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
<button
                 type="button"
                 onClick={
                   closeModal
                 }
                 disabled={
                   saving
                 }
                 className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
>
                 Cancel
</button>
<button
                 type="submit"
                 disabled={
                   saving
                 }
                 className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
>
                 {saving ? (
<Loader2
                     size={16}
                     className="animate-spin"
                   />
                 ) : (
<CheckCircle2
                     size={16}
                   />
                 )}
                 {editingUser
                   ? "Save Changes"
                   : "Create User"}
</button>
</div>
</form>
</div>
</div>
     )}
</>
 );
}
