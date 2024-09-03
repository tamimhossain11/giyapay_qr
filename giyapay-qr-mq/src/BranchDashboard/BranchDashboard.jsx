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

const BranchDashboard = () => {
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
        "http://localhost:3000/auth/logout",
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
      navigate("/"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
    handleMenuClose();
  };

  const handleProfileView = () => {
    navigate("/branch-dashboard/profile");
    handleMenuClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="dashboard-container">
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

          <Link to="/branch-dashboard" className="brand">
            <i className="bi bi-wallet2 fs-3 me-2"></i>
            <span className="brand-text">Branch User</span>
          </Link>

          <nav className="nav-links">
            <Link to="/branch-dashboard/manage-qr">Manage Qr</Link>
            <Link to="/branch-dashboard/add-qr">Add Qr</Link>
          </nav>

          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
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
            to="/branch-dashboard/manage-qr"
            onClick={handleDrawerToggle}
            className="drawer-menu-item"
          >
            <ListItemText primary="Manage Qr" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/branch-dashboard/add-qr"
            onClick={handleDrawerToggle}
            className="drawer-menu-item"
          >
            <ListItemText primary="Add Qr" />
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

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default BranchDashboard;
