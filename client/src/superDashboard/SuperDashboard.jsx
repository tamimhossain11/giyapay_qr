import React, { useState } from "react";
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
} from "@mui/material";
import {
  AccountCircle,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/dashboard.css";

const SuperDashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

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

      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("valid");

      console.log("Logout successful");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Add some user feedback, e.g., a notification or alert
    }
    handleMenuClose();
  };

  const handleProfileView = () => {
    navigate("/super-dashboard/profile");
    handleMenuClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          {/* Menu button for mobile */}
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

          {/* Brand logo and title */}
          <Link to="/super-dashboard" className="brand">
            <i className="bi bi-wallet2 fs-3 me-2"></i>
            <span className="brand-text">Super Admin</span>
          </Link>

          {/* Navigation links for larger screens */}
          <nav className="nav-links">
            <Link to="/super-dashboard">Dashboard</Link>
            <Link to="/super-dashboard/manage-branches">Manage Branches</Link>
            <Link to="/super-dashboard/manage-users">Manage Users</Link>
            <Link to="/super-dashboard/manage-qr">Qr list</Link>
          </nav>

          {/* Profile icon for larger screens */}
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

          {/* Profile dropdown menu */}
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

      {/* Drawer for mobile menu */}
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
          edge="end"
          aria-label="close drawer"
          onClick={handleDrawerToggle}
          className="drawer-close-icon"
        >
          <CloseIcon />
        </IconButton>
        <Divider />
        <List>
          <ListItem
            button
            component={Link}
            to="/super-dashboard"
            onClick={handleDrawerToggle}
            className="drawer-menu-item"
          >
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/super-dashboard/manage-branches"
            onClick={handleDrawerToggle}
            className="drawer-menu-item"
          >
            <ListItemText primary="Manage Branches" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/super-dashboard/manage-users"
            onClick={handleDrawerToggle}
            className="drawer-menu-item"
          >
            <ListItemText primary="Manage Users" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/super-dashboard/manage-qr"
            onClick={handleDrawerToggle}
            className="drawer-menu-item"
          >
            <ListItemText primary="Qr list" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              handleProfileView();
              handleDrawerToggle();
            }}
            className="drawer-menu-item"
          >
            <ListItemText primary="View Profile" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              handleLogout();
              handleDrawerToggle();
            }}
            className="drawer-menu-item"
          >
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperDashboard;
