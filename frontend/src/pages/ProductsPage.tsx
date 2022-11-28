import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal, Table } from "react-bootstrap";
import AppPage from "../common/AppPage";
import GlobalContext from "../context/GlobalStateContext";
import IProduct from "../interfaces/IProduct";
import DataServices from "../services/DataServices";

const ProductsPage = () => {
  const isMounted = useRef(false);
  const [allProducts, setAllProducts] = useState([] as IProduct[]);
  const [newProduct, setNewProduct] = useState({} as IProduct);
  const [productIdToRemove, setProductIdToRemove] = useState("");

  const { showSuccess, showException, isUserSeller, userId } =
    useContext(GlobalContext);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const getAllProducts = () => {
    DataServices.getAllProducts()
      .then((data) => {
        setAllProducts(data);
      })
      .catch((e) => {
        showException && showException(e);
      });
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      getAllProducts();
    }
  }, []);

  const addProduct = () => {
    DataServices.addProduct(newProduct)
      .then(() => {
        getAllProducts();
        setNewProduct(
          () =>
            ({
              cost: "",
              productName: "",
              amountAvailable: "",
            } as any)
        );
        showSuccess && showSuccess("Product successfully added.", true);
      })
      .catch((e) => {
        showException && showException(e);
      });
  };

  const removeProduct = (productId: string) => {
    setProductIdToRemove(productId);
    setShowRemoveModal(true);
  };

  const confirmRemoveProduct = () => {
    DataServices.removeProduct(productIdToRemove)
      .then(() => {
        getAllProducts();
        setShowRemoveModal(false);
        showSuccess && showSuccess("Product successfully removed.", true);
      })
      .catch((e) => {
        showException && showException(e);
      });
  };

  const onNewProductValueChange = (event: any) => {
    setNewProduct((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }));
  };

  const addModal = (
    <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add new product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formProductName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="productName"
              placeholder="Enter product name"
              value={newProduct.productName}
              onChange={onNewProductValueChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formProductCost">
            <Form.Label>Cost</Form.Label>
            <Form.Control
              type="number"
              name="cost"
              placeholder="Enter product cost"
              value={newProduct.cost}
              onChange={onNewProductValueChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formProductAmountAvailable">
            <Form.Label>Amount Available</Form.Label>
            <Form.Control
              type="number"
              name="amountAvailable"
              placeholder="Enter product amount available"
              value={newProduct.amountAvailable}
              onChange={onNewProductValueChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={addProduct}
          disabled={
            !newProduct.productName ||
            !newProduct.cost ||
            !newProduct.amountAvailable
          }
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const removeModal = (
    <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Remove product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="danger">
          Are you sure you want to delete the product?
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
          No
        </Button>
        <Button variant="danger" onClick={confirmRemoveProduct}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <AppPage header="Products">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th className="text-end">Cost</th>
            <th className="text-end">Amount Available</th>
            <th>Seller Id</th>
            {isUserSeller && (
              <th>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add
                </Button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {allProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.productName}</td>
              <td className="text-end">{product.cost} $</td>
              <td className="text-end">{product.amountAvailable}</td>
              <td>{product.sellerId}</td>
              {isUserSeller && (
                <td>
                  {userId && product.sellerId && product.sellerId === userId && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeProduct(product.id)}
                    >
                      Remove
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {addModal}
      {removeModal}
    </AppPage>
  );
};

export default ProductsPage;
