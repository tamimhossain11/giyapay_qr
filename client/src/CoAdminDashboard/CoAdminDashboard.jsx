import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { AccountCircle, Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/dashboard.css";

const CoAdminDashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false); // For controlling modal visibility
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expirationTime = localStorage.getItem("expirationTime");

    const currentTime = Date.now();
    if (expirationTime && currentTime >= expirationTime) {
      // Token is expired, show modal and log out
      setSessionExpired(true);  // Show session timeout modal
    } else if (!token) {
      navigate("/"); // No token, redirect to login
    }
  }, [navigate]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("expirationTime");

      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
    handleMenuClose();
  };

  const fallbackLogout = () => {
    // Clear session details regardless of token state
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    navigate("/"); // Redirect to login
  };

  const handleProfileView = () => {
    navigate("/co-admin-dashboard/profile");
    handleMenuClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRouteClick = (route) => {
    const expirationTime = localStorage.getItem("expirationTime");
    const currentTime = Date.now();

    if (currentTime >= expirationTime) {
      handleLogout(); // Log out if expired
    } else {
      navigate(route); // Navigate to route
    }
  };

  return (
    <div className={`dashboard-container ${sessionExpired ? 'blurred-background' : ''}`}>
      <header className="dashboard-header">
        <div className="header-content">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            className="menu-button"
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Link to="/co-admin-dashboard" className="brand">
            <i className="bi bi-wallet2 fs-3 me-2"></i>
            <span className="brand-text">Co Admin</span>
          </Link>

          <nav className="nav-links">
          <Link to="/co-admin-dashboard" onClick={() => handleRouteClick("/co-admin-dashboard")}>Dashboard</Link>
            <Link to="/co-admin-dashboard/manage-qr" onClick={() => handleRouteClick("/co-admin-dashboard/manage-qr")}> Manage Qr</Link>
          </nav>

          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            className="profile-icon"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <AccountCircle fontSize="large" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            id="primary-search-account-menu"
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfileView}>View Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </header>
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: "100%",
            padding: "10px 20px",
            borderRadius: "0",
            margin: "0 auto",
            boxShadow: "none",
          },
        }}
      >
        <IconButton
          edge="start"  // Changed from "end" to "start" to position the icon on the left
          aria-label="close drawer"
          onClick={handleDrawerToggle}
          className="drawer-close-icon"
          sx={{ alignSelf: "flex-start" }}  // Style to ensure the icon is aligned to the left
        >
          <CloseIcon />
        </IconButton>
        <Divider />
        <List>
        <ListItem button onClick={() => { handleRouteClick("/co-admin-dashboard"); handleDrawerToggle(); }}>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => { handleRouteClick("/co-admin-dashboard/manage-qr"); handleDrawerToggle(); }}>
            <ListItemText primary="Manage QR" />
          </ListItem>
          <ListItem button onClick={() => { handleProfileView(); handleDrawerToggle(); }}>
            <ListItemText primary="View Profile" />
          </ListItem>
          <ListItem button onClick={() => { handleLogout(); handleDrawerToggle(); }}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>


      {/* Session Timeout Modal */}
      <Dialog
        open={sessionExpired}
        onClose={fallbackLogout}
        aria-labelledby="session-timeout-dialog"
        className="modal-overlay"
      >
        <DialogTitle id="session-timeout-dialog">Session Expired</DialogTitle>
        <DialogContent>
          Your session has expired. Please log in again.
        </DialogContent>
        <DialogActions>
          <Button onClick={fallbackLogout} color="primary" variant="contained">
            Login
          </Button>
        </DialogActions>
      </Dialog>

      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default CoAdminDashboard;
