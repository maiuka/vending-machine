import { useContext } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { Container, Nav, Navbar } from "react-bootstrap";
import "./App.css";
import BuyPage from "./pages/BuyPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import ProductsPage from "./pages/ProductsPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import ToastMessages from "./common/ToastMessages";
import GlobalContext from "./context/GlobalStateContext";

function App() {
  const navigate = useNavigate();

  const {
    isUserAuthenticated,
    isUserBuyer,
    onLogout,
    appMessages,
    showSuccess,
    closeMessage,
  } = useContext(GlobalContext);

  const onLogoutClick = () => {
    onLogout && onLogout();
    navigate("/");
    showSuccess && showSuccess("User successfully logged out.", true);
  };

  return (
    <>
      <Navbar bg="light" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Vending Machine</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="app-navbar" />
          <Navbar.Collapse id="app-navbar">
            <Nav className="me-auto">
              {isUserAuthenticated && (
                <LinkContainer to="/users">
                  <Nav.Link>Users</Nav.Link>
                </LinkContainer>
              )}
              <LinkContainer to="/products">
                <Nav.Link>Products</Nav.Link>
              </LinkContainer>
              {isUserBuyer && (
                <LinkContainer to="/buy">
                  <Nav.Link>Buy</Nav.Link>
                </LinkContainer>
              )}
            </Nav>
            <Nav>
              {!isUserAuthenticated && (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>Login</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link>Register</Nav.Link>
                  </LinkContainer>
                </>
              )}
              {isUserAuthenticated && (
                <Nav.Link onClick={onLogoutClick}>Logout</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <ToastMessages
        messages={appMessages}
        onClose={(_m, i) => closeMessage && closeMessage(i)}
      />
      <Container className="mt-5">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {isUserAuthenticated && (
            <Route path="/users" element={<UsersPage />} />
          )}
          <Route path="/products" element={<ProductsPage />} />
          {isUserBuyer && <Route path="/buy" element={<BuyPage />} />}
          {!isUserAuthenticated && (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </>
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
