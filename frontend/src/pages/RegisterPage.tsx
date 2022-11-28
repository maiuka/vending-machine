import { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AppPage from "../common/AppPage";
import GlobalContext from "../context/GlobalStateContext";
import Roles from "../core/roles";
import IRegisterUser from "../interfaces/IRegisterUser";
import DataServices from "../services/DataServices";

const RegisterPage = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    role: "",
  } as IRegisterUser);

  const navigate = useNavigate();

  const { showSuccess, showException } = useContext(GlobalContext);

  const onValueChange = (event: any) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const onRegister = () => {
    DataServices.registerUser(user)
      .then(() => {
        navigate("/login");
        showSuccess && showSuccess("User successfully registered.", true);
      })
      .catch((e) => {
        showException && showException(e);
      });
  };

  return (
    <AppPage header="Register a new user">
      <Form>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Enter username"
            value={user.username}
            onChange={onValueChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={user.password}
            onChange={onValueChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formRole">
          <Form.Label>Role:</Form.Label>
          <Form.Check
            inline
            type="radio"
            name="role"
            id={Roles.SELLER}
            label="Seller"
            value={Roles.SELLER}
            className="ms-3"
            checked={user.role === Roles.SELLER}
            onChange={onValueChange}
          />
          <Form.Check
            inline
            type="radio"
            name="role"
            id={Roles.BUYER}
            label="Buyer"
            value={Roles.BUYER}
            checked={user.role === Roles.BUYER}
            onChange={onValueChange}
          />
        </Form.Group>
        <Button
          variant="primary"
          disabled={!user.username || !user.password || !user.role}
          onClick={onRegister}
        >
          Register
        </Button>
      </Form>
    </AppPage>
  );
};

export default RegisterPage;
