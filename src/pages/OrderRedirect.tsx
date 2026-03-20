import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { getOrderById } from '../utils/orderStorage';
import { getProjectById } from '../utils/projectStorage';

/**
 * Redirects /order/:id to /overview with order and project in state.
 * Used when clicking order nodes in the Sankey chart.
 */
export default function OrderRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.ORDERS, { replace: true });
      return;
    }

    const order = getOrderById(id);
    if (!order) {
      navigate(ROUTES.ORDERS, { replace: true });
      return;
    }

    const project = getProjectById(order.projectId) ?? {
      id: order.projectId,
      name: '项目',
      code: 'PRJT',
    };

    navigate(ROUTES.OVERVIEW, { state: { order, project }, replace: true });
  }, [id, navigate]);

  return null;
}
