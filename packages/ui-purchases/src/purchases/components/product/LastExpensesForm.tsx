import { __ } from "coreui/utils";
import React from "react";
import Table from "@erxes/ui/src/components/table";

function LastExpensesForm({ expenseAmountData }) {
  return (
    <Table $whiteSpace="nowrap" $hover={true}>
      <thead>
        <tr>
          <th>{__("PRODUCT / SERVICE")}</th>
          <th>{__("QUANTITY")}</th>
          <th>{__("AMOUNT")}</th>
          <th>{__("UNIT PRICE")}</th>
          <th>{__("EXPENSE")}</th>
          <th>{__("AMOUNT WITH EXPENSE")}</th>
        </tr>
      </thead>
      <tbody>
        {expenseAmountData.map((item, key) => {
          return (
            <tr key={key}>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>{(item.amount || 0).toLocaleString()}</td>
              <td>{(item.unitPrice || 0).toLocaleString()}</td>
              <td>{(item.expenseAmount || 0).toLocaleString()}</td>
              <td>
                {(
                  (item.amount || 0) + (item.expenseAmount || 0)
                ).toLocaleString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default LastExpensesForm;
