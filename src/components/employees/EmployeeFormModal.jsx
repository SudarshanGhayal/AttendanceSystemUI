import { useState } from 'react';
import Modal from '../common/Modal';
import { formatDateInput, todayInput } from '../../utils/format';

const emptyForm = {
  fullName: '',
  fatherHusbandName: '',
  gender: '',
  dateOfBirth: '',
  phoneNumber: '',
  address: '',
  designation: '',
  dateOfJoining: todayInput(),
  dailyWage: '',
  bankAccountNo: '',
  bankIFSC: '',
};

export default function EmployeeFormModal({ employee, onClose, onSubmit, submitting }) {
  const isEdit = !!employee;
  const [form, setForm] = useState(() =>
    employee
      ? {
          fullName: employee.fullName || '',
          fatherHusbandName: employee.fatherHusbandName || '',
          gender: employee.gender || '',
          dateOfBirth: formatDateInput(employee.dateOfBirth),
          phoneNumber: employee.phoneNumber || '',
          address: employee.address || '',
          designation: employee.designation || '',
          dateOfJoining: formatDateInput(employee.dateOfJoining) || todayInput(),
          dailyWage: employee.dailyWage ?? '',
          bankAccountNo: employee.bankAccountNo || '',
          bankIFSC: employee.bankIFSC || '',
          isActive: employee.isActive,
        }
      : emptyForm
  );
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) return setError('Full name is required.');
    if (!form.dateOfJoining) return setError('Date of joining is required.');
    if (form.dailyWage === '' || Number(form.dailyWage) < 0) return setError('Enter a valid daily wage.');

    const payload = {
      ...form,
      dailyWage: Number(form.dailyWage),
      dateOfBirth: form.dateOfBirth || null,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit employee' : 'Add new employee'} onClose={onClose} width={620}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="fullName">Full name *</label>
            <input id="fullName" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="fatherHusbandName">Father / Husband name</label>
            <input id="fatherHusbandName" value={form.fatherHusbandName} onChange={(e) => update('fatherHusbandName', e.target.value)} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
              <option value="">Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="dateOfBirth">Date of birth</label>
            <input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="phoneNumber">Phone number</label>
            <input id="phoneNumber" value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="designation">Designation</label>
            <input id="designation" placeholder="e.g. Gardener, Helper, Supervisor" value={form.designation} onChange={(e) => update('designation', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="address">Address</label>
          <textarea id="address" rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="dateOfJoining">Date of joining *</label>
            <input id="dateOfJoining" type="date" required value={form.dateOfJoining} onChange={(e) => update('dateOfJoining', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dailyWage">Daily wage (₹) *</label>
            <input id="dailyWage" type="number" min="0" step="0.01" required value={form.dailyWage} onChange={(e) => update('dailyWage', e.target.value)} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="bankAccountNo">Bank account no.</label>
            <input id="bankAccountNo" value={form.bankAccountNo} onChange={(e) => update('bankAccountNo', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="bankIFSC">IFSC code</label>
            <input id="bankIFSC" value={form.bankIFSC} onChange={(e) => update('bankIFSC', e.target.value.toUpperCase())} />
          </div>
        </div>

        {isEdit && (
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update('isActive', e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Active employee
            </label>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}