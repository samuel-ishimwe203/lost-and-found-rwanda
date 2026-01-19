import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function ManagePoliceRegistrations() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [action, setAction] = useState(null); // 'approve' or 'reject'

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/police/pending");
      setPendingRequests(response.data.data.pendingRequests || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setAction("approve");
    setApprovalRemarks("");
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setAction("reject");
    setRejectionReason("");
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;

    try {
      await apiClient.post(`/admin/police/approve/${selectedRequest.id}`, {
        remarks: approvalRemarks
      });

      // Refresh the list
      fetchPendingRequests();
      setSelectedRequest(null);
      setAction(null);
      alert("Police registration approved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve registration");
    }
  };

  const submitRejection = async () => {
    if (!selectedRequest || !rejectionReason) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await apiClient.post(`/admin/police/reject/${selectedRequest.id}`, {
        reason: rejectionReason
      });

      // Refresh the list
      fetchPendingRequests();
      setSelectedRequest(null);
      setAction(null);
      alert("Police registration rejected successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject registration");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Loading pending requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          👮 Police Registrations
        </h2>
        <p className="text-gray-600">
          Review and approve/reject pending police officer registrations
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 font-medium">✓ No pending police registrations</p>
          <p className="text-blue-600 text-sm mt-2">All police registrations have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">
              ⚠️ {pendingRequests.length} pending registration{pendingRequests.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-800">{request.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-800">{request.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Badge Number</p>
                    <p className="font-semibold text-gray-800">{request.badge_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rank</p>
                    <p className="font-semibold text-gray-800">{request.rank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Police Station</p>
                    <p className="font-semibold text-gray-800">{request.police_station}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-semibold text-gray-800">{request.district}</p>
                  </div>
                  {request.department && (
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-semibold text-gray-800">{request.department}</p>
                    </div>
                  )}
                  {request.email_official && (
                    <div>
                      <p className="text-sm text-gray-600">Official Email</p>
                      <p className="font-semibold text-gray-800">{request.email_official}</p>
                    </div>
                  )}
                  {request.phone_official && (
                    <div>
                      <p className="text-sm text-gray-600">Official Phone</p>
                      <p className="font-semibold text-gray-800">{request.phone_official}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold text-gray-800">{request.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registration Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.document_url && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Official Document</p>
                    <a
                      href={request.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      📄 View Document
                    </a>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(request)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {action === "approve" && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Approve Police Registration
            </h3>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Officer:</p>
              <p className="font-semibold text-gray-800">{selectedRequest.full_name}</p>
              <p className="text-sm text-gray-600 mt-1">Badge: {selectedRequest.badge_number}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (optional):
              </label>
              <textarea
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Add any remarks about the approval..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                rows="3"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAction(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {action === "reject" && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Reject Police Registration
            </h3>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Officer:</p>
              <p className="font-semibold text-gray-800">{selectedRequest.full_name}</p>
              <p className="text-sm text-gray-600 mt-1">Badge: {selectedRequest.badge_number}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                rows="3"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAction(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
