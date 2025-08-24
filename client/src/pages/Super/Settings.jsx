import React, { useState, useEffect } from "react";
import { fetchUserById, updateAdmin } from "../../services/userService";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";

function Settings() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id;
        if (userId) {
          const userData = await fetchUserById(userId);
          const userInfo = userData.data;
          setUser(userInfo);
          setFormData({
            name: userInfo.names || "",
            email: userInfo.email || "",
            phoneNumber: userInfo.phoneNumber || "",
            nationalId: userInfo.nationalId || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await updateAdmin(user._id, formData);
      setUser(formData);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update profile.");
    }
  };

  if (!user)
    return (
      <Stack alignItems="center" mt={5}>
        <CircularProgress />
      </Stack>
    );

  return (
    <Card sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          User Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {!editing ? (
          <Stack spacing={2}>
            <Typography>
              <strong>Full Name:</strong> {user.names}
            </Typography>
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography>
              <strong>Telephone:</strong> {user.phoneNumber}
            </Typography>
            <Typography>
              <strong>National ID:</strong> {user.nationalId}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditing(true)}
            >
              Update
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Telephone"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="National ID"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              fullWidth
            />
            <Stack direction="row" spacing={2} mt={1}>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpdate}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default Settings;
