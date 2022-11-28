import { Card } from "react-bootstrap";

export interface AppPageProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const AppPage = (props: AppPageProps) => {
  return (
    <Card>
      <Card.Body>
        {props.header && <Card.Header>{props.header}</Card.Header>}
        {props.children && <Card.Body>{props.children}</Card.Body>}
        {props.footer && <Card.Body>{props.footer}</Card.Body>}
      </Card.Body>
    </Card>
  );
};

export default AppPage;
