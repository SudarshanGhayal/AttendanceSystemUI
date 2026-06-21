import apiClient, { unwrap, downloadFile } from '../hooks/clinet';

export const reportsApi = {
  getDashboard: () => unwrap(apiClient.get('/reports/dashboard')),

  getMonthlyAttendance: (month, year) =>
    unwrap(apiClient.get('/reports/attendance', { params: { month, year } })),

  getPayroll: (month, year) =>
    unwrap(apiClient.get('/reports/payroll', { params: { month, year } })),
};

export const exportApi = {
  attendanceExcel: (month, year) =>
    downloadFile('/export/attendance/excel', { month, year }, `Attendance_${year}_${String(month).padStart(2, '0')}.xlsx`),

  attendancePdf: (month, year) =>
    downloadFile('/export/attendance/pdf', { month, year }, `Attendance_${year}_${String(month).padStart(2, '0')}.pdf`),

  payrollExcel: (month, year) =>
    downloadFile('/export/payroll/excel', { month, year }, `Payroll_${year}_${String(month).padStart(2, '0')}.xlsx`),

  payslipPdf: (salaryId, employeeName) =>
    downloadFile(`/export/payslip/${salaryId}/pdf`, {}, `Payslip_${employeeName || salaryId}.pdf`),
};