import { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AppPage from "../common/AppPage";
import DataServices from "../services/DataServices";
import GlobalContext from "../context/GlobalStateContext";

const LoginPage = () => {
  const { onLogin, showSuccess, showException } = useContext(GlobalContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onLoginClick = () => {
    DataServices.loginUser(username, password)
      .then((response) => {
        onLogin && onLogin(response, true);
        navigate("/");
        showSuccess && showSuccess("User successfully logged in.", true);
      })
      .catch((e) => {
        showException && showException(e);
      });
  };

  return (
    <AppPage header="Login">
      <Form>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button
          variant="primary"
          disabled={!username || !password}
          onClick={onLoginClick}
        >
          Login
        </Button>
      </Form>
    </AppPage>
  );
};

export default LoginPage;
