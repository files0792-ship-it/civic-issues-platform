export default function AdminGovIdField({ id, value, onChange }) {
  return (
    <div className="animate-[fadeSlideIn_0.3s_ease-out]">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        Government Authentication ID
      </label>
      <input
        id={id}
        type="text"
        required
        value={value}
        onChange={onChange}
        placeholder="Enter your Government Authentication ID"
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
      />
      <p className="mt-1.5 text-xs text-slate-500">
        This ID is issued by the Government Authority and is required for administrator authentication.
      </p>
    </div>
  );
}
