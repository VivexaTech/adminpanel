import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, addDoc, updateDoc, doc, Timestamp, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { FiLogIn, FiLogOut, FiCalendar, FiClock, FiAlertCircle, FiX, FiCheckCircle } from 'react-icons/fi';
import './EmployeeAttendance.css';

const EmployeeAttendance = ({ staff }) => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveNote, setLeaveNote] = useState('');

  useEffect(() => {
    checkTodayAttendance();
  }, [staff]);

  const checkTodayAttendance = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if attendance exists for today
      let todayAttendanceFound = null;
      
      try {
        // Try with index first (efficient query)
        const q = query(
          collection(db, 'attendance'),
          where('staffId', '==', staff.id),
          where('date', '>=', Timestamp.fromDate(today)),
          where('date', '<', Timestamp.fromDate(tomorrow))
        );

        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          todayAttendanceFound = { id: doc.id, ...doc.data() };
        }
      } catch (indexError) {
        // If index error, fallback to fetching all attendance and filtering in memory
        if (indexError.code === 'failed-precondition') {
          console.log('Index not ready, using fallback query');
          try {
            const fallbackQuery = query(
              collection(db, 'attendance'),
              where('staffId', '==', staff.id)
            );
            const fallbackSnapshot = await getDocs(fallbackQuery);
            
            // Filter for today's attendance in memory
            fallbackSnapshot.forEach((doc) => {
              const data = doc.data();
              const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
              if (date >= today && date < tomorrow) {
                todayAttendanceFound = { id: doc.id, ...data };
              }
            });
          } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            // Continue - will show check-in button anyway
          }
        } else {
          throw indexError; // Re-throw if it's not an index error
        }
      }

      if (todayAttendanceFound) {
        setTodayAttendance(todayAttendanceFound);
      } else {
        // Check if it's been more than 24 hours since last attendance
        // Fetch recent attendance (last 7 days) to check
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        try {
          const recentQuery = query(
            collection(db, 'attendance'),
            where('staffId', '==', staff.id),
            where('date', '>=', Timestamp.fromDate(weekAgo)),
            limit(10)
          );
          const recentSnapshot = await getDocs(recentQuery);
          
          let lastAttendance = null;
          recentSnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
            if (!lastAttendance || date > (lastAttendance.date?.toDate ? lastAttendance.date.toDate() : new Date(0))) {
              lastAttendance = { id: doc.id, date, ...data };
            }
          });

          // Auto-mark absent if no attendance in last 24 hours
          if (lastAttendance && lastAttendance.date) {
            const lastDate = lastAttendance.date instanceof Date 
              ? lastAttendance.date 
              : new Date(lastAttendance.date);
            const hoursSinceLastAttendance = (new Date() - lastDate) / (1000 * 60 * 60);
            
            // Only auto-mark if last attendance was more than 24 hours ago and not today
            if (hoursSinceLastAttendance > 24 && lastDate.toDateString() !== today.toDateString()) {
              // Check if yesterday was already marked
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStart = new Date(yesterday);
              yesterdayStart.setHours(0, 0, 0, 0);
              const yesterdayEnd = new Date(yesterday);
              yesterdayEnd.setHours(23, 59, 59, 999);
              
              const yesterdayQuery = query(
                collection(db, 'attendance'),
                where('staffId', '==', staff.id),
                where('date', '>=', Timestamp.fromDate(yesterdayStart)),
                where('date', '<=', Timestamp.fromDate(yesterdayEnd)),
                limit(1)
              );
              
              try {
                const yesterdaySnapshot = await getDocs(yesterdayQuery);
                if (yesterdaySnapshot.empty) {
                  // Auto-create absent record for yesterday
                  await addDoc(collection(db, 'attendance'), {
                    staffId: staff.id,
                    date: Timestamp.fromDate(yesterdayStart),
                    status: 'absent',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
                }
              } catch (yesterdayError) {
                // Ignore index errors for auto-marking (not critical)
                console.log('Could not auto-mark absent:', yesterdayError);
              }
            }
          }
        } catch (recentError) {
          // If index error, skip auto-marking (not critical)
          console.log('Could not check recent attendance:', recentError);
        }
        
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
      // Always set to null on error so check-in button can show
      // Only show error toast for non-index errors
      if (error.code !== 'failed-precondition') {
        toast.error('Failed to check attendance. You can still mark attendance manually.');
      } else {
        // Index error - show info message but allow manual marking
        console.log('Firestore index not ready. Attendance marking still available.');
      }
      setTodayAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setMarking(true);
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      if (todayAttendance) {
        // Update existing record
        await updateDoc(doc(db, 'attendance', todayAttendance.id), {
          status: 'present',
          checkIn: Timestamp.fromDate(now),
          updatedAt: new Date(),
        });
        toast.success('Check-in recorded');
      } else {
        // Create new record
        await addDoc(collection(db, 'attendance'), {
          staffId: staff.id,
          date: Timestamp.fromDate(today),
          status: 'present',
          checkIn: Timestamp.fromDate(now),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success('Check-in recorded');
      }
      
      checkTodayAttendance();
    } catch (error) {
      console.error('Error marking check-in:', error);
      toast.error('Failed to mark check-in');
    } finally {
      setMarking(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setMarking(true);
      const now = new Date();

      if (todayAttendance) {
        await updateDoc(doc(db, 'attendance', todayAttendance.id), {
          checkOut: Timestamp.fromDate(now),
          updatedAt: new Date(),
        });
        toast.success('Check-out recorded');
        checkTodayAttendance();
      } else {
        toast.error('Please check in first');
      }
    } catch (error) {
      console.error('Error marking check-out:', error);
      toast.error('Failed to mark check-out');
    } finally {
      setMarking(false);
    }
  };

  const handleLeaveRequest = async () => {
    if (!leaveNote.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }

    try {
      setMarking(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (todayAttendance) {
        await updateDoc(doc(db, 'attendance', todayAttendance.id), {
          status: 'leave',
          leaveType: 'other',
          notes: leaveNote,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'attendance'), {
          staffId: staff.id,
          date: Timestamp.fromDate(today),
          status: 'leave',
          leaveType: 'other',
          notes: leaveNote,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      toast.success('Leave request submitted');
      setShowLeaveModal(false);
      setLeaveNote('');
      checkTodayAttendance();
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setMarking(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="loading-state">Loading attendance...</div>;
  }

  return (
    <div className="employee-attendance">
      <h2>Today's Attendance</h2>

      <div className="attendance-card">
        <div className="attendance-status">
          {todayAttendance?.status === 'present' ? (
            <div className="status-badge present">
              <FiCheckCircle />
              <span>Present</span>
            </div>
          ) : todayAttendance?.status === 'leave' ? (
            <div className="status-badge leave">
              <FiCalendar />
              <span>On Leave</span>
            </div>
          ) : todayAttendance?.status === 'absent' ? (
            <div className="status-badge absent">
              <FiAlertCircle />
              <span>Absent</span>
            </div>
          ) : (
            <div className="status-badge not-marked">
              <FiClock />
              <span>Not Marked</span>
            </div>
          )}
        </div>

        {todayAttendance?.checkIn && (
          <div className="time-info">
            <div className="time-item">
              <FiLogIn />
              <span>Check In: {formatTime(todayAttendance.checkIn)}</span>
            </div>
            {todayAttendance?.checkOut && (
              <div className="time-item">
                <FiLogOut />
                <span>Check Out: {formatTime(todayAttendance.checkOut)}</span>
              </div>
            )}
          </div>
        )}

        {todayAttendance?.status === 'leave' && todayAttendance?.notes && (
          <div className="leave-notes">
            <strong>Leave Reason:</strong>
            <p>{todayAttendance.notes}</p>
          </div>
        )}

        <div className="attendance-actions">
          {!todayAttendance || todayAttendance.status === 'absent' ? (
            <>
              <button
                className="btn btn-primary btn-checkin"
                onClick={handleCheckIn}
                disabled={marking}
              >
                <FiLogIn />
                <span>Check In</span>
              </button>
              <button
                className="btn btn-secondary btn-leave"
                onClick={() => setShowLeaveModal(true)}
                disabled={marking}
              >
                <FiCalendar />
                <span>Request Leave</span>
              </button>
            </>
          ) : todayAttendance.checkIn && !todayAttendance.checkOut ? (
            // Show check-out button if checked in but not checked out
            <button
              className="btn btn-primary btn-checkout"
              onClick={handleCheckOut}
              disabled={marking}
            >
              <FiLogOut />
              <span>Check Out</span>
            </button>
          ) : todayAttendance.checkIn && todayAttendance.checkOut ? (
            // Show completed message if both check-in and check-out are done
            <div className="completed-message">
              <FiCheckCircle />
              <span>Attendance completed for today</span>
            </div>
          ) : todayAttendance.status === 'leave' ? (
            // If on leave, show leave status (no action buttons)
            <div className="leave-status-message">
              <FiCalendar />
              <span>You are on leave today</span>
            </div>
          ) : (
            // Fallback: show check-in if somehow attendance exists but no check-in
            <button
              className="btn btn-primary btn-checkin"
              onClick={handleCheckIn}
              disabled={marking}
            >
              <FiLogIn />
              <span>Check In</span>
            </button>
          )}
        </div>
      </div>

      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => {
          setShowLeaveModal(false);
          setLeaveNote('');
        }}>
          <div className="modal-content leave-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Leave</h3>
              <button className="close-btn" onClick={() => {
                setShowLeaveModal(false);
                setLeaveNote('');
              }}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Reason for Leave *</label>
                <textarea
                  value={leaveNote}
                  onChange={(e) => setLeaveNote(e.target.value)}
                  placeholder="Please provide a reason for your leave..."
                  rows="4"
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLeaveModal(false);
                    setLeaveNote('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleLeaveRequest}
                  disabled={marking || !leaveNote.trim()}
                >
                  {marking ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
