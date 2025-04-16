'use client';
import React, { StrictMode, useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

import type { ColDef, CellContextMenuEvent } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Import AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./Grid.css";

ModuleRegistry.registerModules([AllCommunityModule]);

// Row Data Interface
interface IRow {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

// Create new GridExample component
export default function Home() {
  const gridRef = useRef<AgGridReact>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    rowData: IRow | null;
    x: number;
    y: number;
  }>({
    show: false,
    rowData: null,
    x: 0,
    y: 0,
  });

  const [editModal, setEditModal] = useState<{
    show: boolean;
    rowData: IRow | null;
  }>({
    show: false,
    rowData: null,
  });

  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IRow[]>([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: "Mercedes", model: "EQA", price: 48890, electric: true },
    { make: "Fiat", model: "500", price: 15774, electric: false },
    { make: "Nissan", model: "Juke", price: 20675, electric: false },
  ]);

  const handleEdit = (rowData: IRow) => {
    setContextMenu({ ...contextMenu, show: false });
    setEditModal({
      show: true,
      rowData: { ...rowData },
    });
  };

  const handleDelete = (rowToDelete: IRow) => {
    const updatedData = rowData.filter((row: IRow) =>
      row.make !== rowToDelete.make ||
      row.model !== rowToDelete.model
    );
    setRowData(updatedData);
    setContextMenu({ ...contextMenu, show: false });
  };

  const handleContextMenu = (event: CellContextMenuEvent) => {
    const rowData = event.data as IRow;
    const mouseEvent = event.event as MouseEvent;

    setContextMenu({
      show: true,
      rowData,
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
    });
  };

  const handleActionClick = (event: React.MouseEvent, rowData: IRow) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();

    setContextMenu({
      show: true,
      rowData,
      x: rect.right,
      y: rect.top,
    });
  };

  const handleSaveEdit = () => {
    if (editModal.rowData) {
      const updatedData = rowData.map(row =>
        row.make === editModal.rowData!.make && row.model === editModal.rowData!.model
          ? editModal.rowData!
          : row
      );
      setRowData(updatedData);
      setEditModal({ show: false, rowData: null });
    }
  };

  // Action cell renderer component
  const ActionCellRenderer = (props: any) => {
    return (
      <div
        onClick={(e) => handleActionClick(e, props.data)}
        className="action-cell"
      >
        <span>⋮</span>
      </div>
    );
  };

  // Prevent default context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const gridContainer = gridContainerRef.current;
    if (gridContainer) {
      gridContainer.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (gridContainer) {
        gridContainer.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const contextMenuElement = document.querySelector('.context-menu');
      if (contextMenuElement && !contextMenuElement.contains(event.target as Node)) {
        setContextMenu({ ...contextMenu, show: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric" },
    {
      headerName: "",
      cellRenderer: ActionCellRenderer,
      width: 50,
      sortable: false,
      filter: false,
      pinned: 'right',
      cellStyle: { padding: '0' },
      suppressMovable: true,
    }
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
  };

  // Container: Defines the grid's theme & dimensions.
  return (
    <div
      ref={gridContainerRef}
      className="ag-theme-alpine grid-container"
    >
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        theme="legacy"
        onCellContextMenu={handleContextMenu}
        suppressContextMenu={true}
      />
      {contextMenu.show && contextMenu.rowData && (
        <div
          className="context-menu"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div
            className="menu-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (contextMenu.rowData) {
                handleEdit(contextMenu.rowData);
              }
            }}
          >
            Edit
          </div>
          <div
            className="menu-item delete"
            onClick={() => handleDelete(contextMenu.rowData!)}
          >
            Delete
          </div>
        </div>
      )}
      {editModal.show && editModal.rowData && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Row</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Make</label>
                <input
                  type="text"
                  value={editModal.rowData.make}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    rowData: { ...editModal.rowData!, make: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={editModal.rowData.model}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    rowData: { ...editModal.rowData!, model: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={editModal.rowData.price}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    rowData: { ...editModal.rowData!, price: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editModal.rowData.electric}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      rowData: { ...editModal.rowData!, electric: e.target.checked }
                    })}
                  />
                  Electric
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEditModal({ show: false, rowData: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
