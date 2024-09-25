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

const SuperDashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expirationTime = localStorage.getItem("expirationTime");

    const currentTime = Date.now();
    if (expirationTime && currentTime >= expirationTime) {
      setSessionExpired(true);
    } else if (!token) {
      navigate("/");
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

      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
    handleMenuClose();
  };

  const fallbackLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    navigate("/");
  };

  const handleProfileView = () => {
    navigate("/super-dashboard/profile");
    handleMenuClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRouteClick = (route) => {
    const expirationTime = localStorage.getItem("expirationTime");
    const currentTime = Date.now();

    if (currentTime >= expirationTime) {
      handleLogout();
    } else {
      navigate(route);
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

          <Link to="/super-dashboard" className="brand">
            <i className="bi bi-wallet2 fs-3 me-2"></i>
            <span className="brand-text">Super Admin</span>
          </Link>

          <nav className="nav-links">
            <Link to="/super-dashboard" onClick={() => handleRouteClick("/super-dashboard")}>Dashboard</Link>
            <Link to="/super-dashboard/manage-branches" onClick={() => handleRouteClick("/super-dashboard/manage-branches")}>
              Manage Branches
            </Link>
            <Link to="/super-dashboard/manage-users" onClick={() => handleRouteClick("/super-dashboard/manage-users")}>
              Manage Users
            </Link>
            <Link to="/super-dashboard/manage-qr" onClick={() => handleRouteClick("/super-dashboard/manage-qr")}>QR List</Link>
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
          edge="start"
          aria-label="close drawer"
          onClick={handleDrawerToggle}
          className="drawer-close-icon"
          sx={{ alignSelf: "flex-start" }}
        >
          <CloseIcon />
        </IconButton>
        <Divider />
        <List>
          <ListItem button onClick={() => { handleRouteClick("/super-dashboard"); handleDrawerToggle(); }}>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => { handleRouteClick("/super-dashboard/manage-branches"); handleDrawerToggle(); }}>
            <ListItemText primary="Manage Branches" />
          </ListItem>
          <ListItem button onClick={() => { handleRouteClick("/super-dashboard/manage-users"); handleDrawerToggle(); }}>
            <ListItemText primary="Manage Users" />
          </ListItem>
          <ListItem button onClick={() => { handleRouteClick("/super-dashboard/manage-qr"); handleDrawerToggle(); }}>
            <ListItemText primary="QR List" />
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

export default SuperDashboard;
