import { Variant } from "react-bootstrap/esm/types";
import { Toast, ToastContainer } from "react-bootstrap";

export interface IToastMessage {
  title: string;
  description: string;
  show?: boolean;
  delay?: number;
  subTitle?: string;
  variant?: Variant;
  autohide?: boolean;
  animation?: boolean;
}

export interface ToastMessagesProps {
  messages?: IToastMessage[];
  onClose?: (msg: IToastMessage, index: number) => void;
}

const ToastMessages = (props: ToastMessagesProps) => {
  const messages = props.messages ?? [];

  return messages.length > 0 ? (
    <div className="position-relative">
      <ToastContainer position="top-center">
        {messages.map((m, i) => (
          <Toast
            key={i}
            bg={m.variant}
            delay={m.delay}
            show={m.show ?? true}
            autohide={m.autohide}
            animation={m.animation}
            onClose={() => props.onClose && props.onClose(m, i)}
          >
            {(m.title || m.subTitle) && (
              <Toast.Header>
                {m.title && <strong className="me-auto">{m.title}</strong>}
                {m.subTitle && (
                  <small className="text-muted">{m.subTitle}</small>
                )}
              </Toast.Header>
            )}
            {m.description && <Toast.Body>{m.description}</Toast.Body>}
          </Toast>
        ))}
      </ToastContainer>
    </div>
  ) : (
    <></>
  );
};

export default ToastMessages;
