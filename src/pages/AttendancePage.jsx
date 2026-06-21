import { useState } from 'react';
import AttendanceSheet from '../components/attandance/AttendanceSheet';
import MonthlyAttendanceGrid from '../components/attandance/MonthlyAttendanceGrid';

export default function AttendancePage() {
  const [tab, setTab] = useState('daily');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Daily record-keeping</div>
          <h1 className="page-title">Attendance</h1>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn${tab === 'daily' ? ' active' : ''}`} onClick={() => setTab('daily')}>
          Daily sheet
        </button>
        <button className={`tab-btn${tab === 'monthly' ? ' active' : ''}`} onClick={() => setTab('monthly')}>
          Monthly grid
        </button>
      </div>

      {tab === 'daily' ? <AttendanceSheet /> : <MonthlyAttendanceGrid />}
    </div>
  );
}