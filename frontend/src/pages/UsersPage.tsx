import { useEffect, useRef, useState } from "react";
import { Table } from "react-bootstrap";
import AppPage from "../common/AppPage";
import IUser from "../interfaces/IUser";
import DataServices from "../services/DataServices";

const UsersPage = () => {
  const isMounted = useRef(false);
  const [users, setUsers] = useState([] as IUser[]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      DataServices.getAllUsers().then((data) => {
        setUsers(data);
      });
    }
  }, []);

  return (
    <AppPage header="Users">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Deposit</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.deposit}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AppPage>
  );
};

export default UsersPage;
