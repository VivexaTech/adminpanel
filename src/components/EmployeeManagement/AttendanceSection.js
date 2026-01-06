import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';
import AttendanceModal from './AttendanceModal';
import './AttendanceSection.css';

const AttendanceSection = ({ staff, onBack }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [staff]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'attendance'),
          where('staffId', '==', staff.id),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const attendanceList = [];
        
        snapshot.forEach((doc) => {
          attendanceList.push({ id: doc.id, ...doc.data() });
        });
        
        setAttendance(attendanceList);
      } catch (indexError) {
        // If index error, fetch without orderBy and sort in memory
        if (indexError.code === 'failed-precondition') {
          console.warn('Index not ready, fetching without orderBy');
          const q = query(
            collection(db, 'attendance'),
            where('staffId', '==', staff.id)
          );
          const snapshot = await getDocs(q);
          const attendanceList = [];
          
          snapshot.forEach((doc) => {
            attendanceList.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort in memory
          attendanceList.sort((a, b) => {
            const aDate = a.date?.toDate || a.date || new Date(0);
            const bDate = b.date?.toDate || b.date || new Date(0);
            return bDate - aDate;
          });
          
          setAttendance(attendanceList);
        } else {
          throw indexError;
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const getAttendanceForDate = (date) => {
    return attendance.find(record => {
      const recordDate = record.date?.toDate
        ? record.date.toDate().toISOString().split('T')[0]
        : record.date;
      return recordDate === date;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'danger';
      case 'leave':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Generate last 30 days
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    leave: attendance.filter(a => a.status === 'leave').length,
  };

  return (
    <div className="attendance-section">
      <div className="section-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft /> Back
          </button>
          <h3>Attendance - {staff.name}</h3>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleMarkAttendance(new Date().toISOString().split('T')[0])}
        >
          <FiCalendar /> Mark Today's Attendance
        </button>
      </div>

      <div className="attendance-stats">
        <div className="stat-card">
          <div className="stat-value success">{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value danger">{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value warning">{stats.leave}</div>
          <div className="stat-label">Leave</div>
        </div>
      </div>

      <div className="attendance-calendar">
        <h4>Last 30 Days</h4>
        {loading ? (
          <div className="loading-state">Loading attendance...</div>
        ) : (
          <div className="calendar-grid">
            {getLast30Days().map((date) => {
              const record = getAttendanceForDate(date);
              const isToday = date === new Date().toISOString().split('T')[0];
              
              return (
                <div
                  key={date}
                  className={`calendar-day ${isToday ? 'today' : ''} ${record ? `status-${getStatusColor(record.status)}` : 'no-record'}`}
                  onClick={() => handleMarkAttendance(date)}
                >
                  <div className="day-number">
                    {new Date(date).getDate()}
                  </div>
                  <div className="day-status">
                    {record ? (
                      <>
                        {record.status === 'present' && record.checkIn && (
                          <div className="time-info">
                            <FiClock /> {record.checkIn.toDate ? record.checkIn.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </div>
                        )}
                        <span className="status-badge">{record.status}</span>
                      </>
                    ) : (
                      <span className="no-record-text">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="attendance-list">
        <h4>Recent Records</h4>
        {attendance.length === 0 ? (
          <div className="no-data">No attendance records found</div>
        ) : (
          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Leave Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    <td>
                      {record.date?.toDate
                        ? record.date.toDate().toLocaleDateString()
                        : record.date || 'N/A'}
                    </td>
                    <td>
                      <span className={`status-badge status-${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      {record.checkIn?.toDate
                        ? record.checkIn.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : record.checkIn || '-'}
                    </td>
                    <td>
                      {record.checkOut?.toDate
                        ? record.checkOut.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : record.checkOut || '-'}
                    </td>
                    <td>{record.leaveType || '-'}</td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          const date = record.date?.toDate
                            ? record.date.toDate().toISOString().split('T')[0]
                            : record.date;
                          setSelectedDate(date);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AttendanceModal
          staff={staff}
          date={selectedDate}
          existingRecord={getAttendanceForDate(selectedDate)}
          onClose={() => {
            setShowModal(false);
            setSelectedDate(new Date().toISOString().split('T')[0]);
          }}
          onSave={fetchAttendance}
        />
      )}
    </div>
  );
};

export default AttendanceSection;
