import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './AdminEvents.css';

interface EventItem {
  _id: string;
  title?: string;
  clientName?: string;
  clientSurname?: string;
  date: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  type: 'event' | 'appointment';
  user?: {
    firstName: string;
    lastName: string;
    username: string;
  };
  organizer?: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'events' | 'appointments'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchEvents();
  }, [filter, statusFilter, currentPage, pageSize]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [eventsRes, appointmentsRes] = await Promise.all([
        adminAPI.getEvents({ 
          page: currentPage,
          limit: pageSize,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }),
        adminAPI.getAppointments({ 
          page: currentPage,
          limit: pageSize,
          status: statusFilter !== 'all' ? statusFilter : undefined
        })
      ]);

      const eventsData = eventsRes.data.data?.events || [];
      const appointmentsData = appointmentsRes.data.data?.appointments || [];
      const eventsPagination = eventsRes.data.data?.pagination;
      const appointmentsPagination = appointmentsRes.data.data?.pagination;

      // Transform events data
      const transformedEvents = eventsData.map((event: any) => {
        const eventData = {
          _id: event._id,
          title: event.title,
          date: event.startDate,
          startDate: event.startDate,
          startTime: event.startDate ? new Date(event.startDate).toTimeString().slice(0, 5) : '',
          endTime: event.endDate ? new Date(event.endDate).toTimeString().slice(0, 5) : '',
          status: event.status,
          type: 'event' as const,
          organizer: event.organizer
        };
        
        return {
          ...eventData,
          status: determineStatus(eventData, 'event')
        };
      });

      // Transform appointments data
      const transformedAppointments = appointmentsData.map((appointment: any) => {
        const appointmentData = {
          _id: appointment._id,
          title: `${appointment.clientName} ${appointment.clientSurname}`,
          clientName: appointment.clientName,
          clientSurname: appointment.clientSurname,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          type: 'appointment' as const,
          user: appointment.user
        };
        
        return {
          ...appointmentData,
          status: determineStatus(appointmentData, 'appointment')
        };
      });

      let combinedData = [...transformedEvents, ...transformedAppointments];
      let paginationInfo = eventsPagination || appointmentsPagination;

      // Filter by type
      if (filter === 'events') {
        combinedData = transformedEvents;
        paginationInfo = eventsPagination;
      } else if (filter === 'appointments') {
        combinedData = transformedAppointments;
        paginationInfo = appointmentsPagination;
      }

      // Sort by date (most recent first)
      combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEvents(combinedData);
      setTotalPages(paginationInfo?.pages || 1);
      setTotalItems(paginationInfo?.total || combinedData.length);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'status-pending',
      upcoming: 'status-upcoming',
      passed: 'status-passed',
      cancelled: 'status-cancelled'
    };

    return (
      <span className={`status-badge ${statusClasses[status as keyof typeof statusClasses] || 'status-default'}`}>
        {status}
      </span>
    );
  };

  const getTypeIcon = (type: 'event' | 'appointment') => {
    return type === 'event' ? '📅' : '👤';
  };

  const determineStatus = (item: any, type: 'event' | 'appointment') => {
    const now = new Date();
    const itemDate = new Date(item.date);
    const itemDateTime = new Date(itemDate);
    
    // If it's an appointment, combine date and time
    if (type === 'appointment' && item.startTime) {
      const [hours, minutes] = item.startTime.split(':').map(Number);
      itemDateTime.setHours(hours, minutes, 0, 0);
    }
    // If it's an event, use the startDate directly
    else if (type === 'event' && item.startDate) {
      itemDateTime.setTime(new Date(item.startDate).getTime());
    }

    // Check if cancelled first
    if (item.status === 'cancelled') {
      return 'cancelled';
    }

    // Check if pending (waiting for confirmation)
    if (item.status === 'pending') {
      return 'pending';
    }

    // Determine if upcoming or passed based on time
    if (itemDateTime > now) {
      return 'upcoming';
    } else {
      return 'passed';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: 'all' | 'events' | 'appointments') => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when status filter changes
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn pagination-prev"
      >
        ← Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-next"
      >
        Next →
      </button>
    );

    return pages;
  };

  if (loading) {
    return (
      <div className="admin-events">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-events">
      <div className="events-header">
        <h2>Event Management</h2>
        <p>Manage calendar events and appointments</p>
      </div>

      <div className="events-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select 
            value={filter} 
            onChange={(e) => handleFilterChange(e.target.value as 'all' | 'events' | 'appointments')}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="events">Events</option>
            <option value="appointments">Appointments</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="upcoming">Upcoming</option>
            <option value="passed">Passed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Items per page:</label>
          <select 
            value={pageSize} 
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="filter-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>User</th>
              <th>Date</th>
              <th>Time</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={`${event.type}-${event._id}`} className="event-row">
                  <td className="type-cell">
                    <span className="type-icon">{getTypeIcon(event.type)}</span>
                    <span className="type-text">{event.type}</span>
                  </td>
                  <td className="user-cell">
                    {event.type === 'event' 
                      ? (event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'N/A')
                      : (event.user ? `${event.user.firstName} ${event.user.lastName}` : 'N/A')
                    }
                  </td>
                  <td className="date-cell">
                    {formatDate(event.date)}
                  </td>
                  <td className="time-cell">
                    {event.startTime && event.endTime 
                      ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                      : event.startTime 
                        ? formatTime(event.startTime)
                        : 'N/A'
                    }
                  </td>
                  <td className="name-cell">
                    {event.title || 'N/A'}
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(event.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="events-summary">
        <div className="summary-info">
          <p>Showing {events.length} of {totalItems} {filter === 'all' ? 'items' : filter}</p>
          <p>Page {currentPage} of {totalPages} (per page: {pageSize})</p>
        </div>
      </div>

      {renderPagination() && (
        <div className="pagination-container">
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
