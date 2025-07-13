import { useCallback } from "react";

// ...

const fetchUsers = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (roleFilter !== "all") params.append("role", roleFilter);
    if (statusFilter !== "all") params.append("status", statusFilter);

    const response = await fetch(`/api/admin/users?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setUsers(data.users);
    }
  } catch (error) {
    console.error("Failed to fetch users:", error);
  } finally {
    setLoading(false);
  }
}, [searchTerm, roleFilter, statusFilter]);

useEffect(() => {
  fetchUsers();
}, [fetchUsers]);
