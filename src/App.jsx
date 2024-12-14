import React from "react";
import { create } from "zustand";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const useStore = create((set) => ({
  partitions: [
    {
      id: "root",
      direction: null,
      children: [],
      color: getRandomColor(),
    },
  ],
  updatePartition: (id, updates) =>
    set((state) => {
      const updateNode = (node) => {
        if (node.id === id) {
          const newNode = { ...node, ...updates };
          if (!node.children || node.children.length === 0) {
            newNode.color = updates.color || node.color;
          }
          return newNode;
        }
        if (node.children?.length) {
          return {
            ...node,
            children: node.children.map(updateNode),
          };
        }
        return node;
      };
      return {
        partitions: state.partitions.map(updateNode),
      };
    }),
  removePartition: (id) =>
    set((state) => {
      const filterNode = (node) => {
        if (node.id === id) return null;
        if (node.children?.length) {
          const filteredChildren = node.children.map(filterNode).filter(Boolean);
          return filteredChildren.length ? { ...node, children: filteredChildren } : null;
        }
        return node;
      };
      return {
        partitions: state.partitions.map(filterNode).filter(Boolean),
      };
    }),
}));

const App = () => {
  const { partitions, updatePartition, removePartition } = useStore();
  
  const splitPartition = (id, direction) => {
    updatePartition(id, {
      direction,
      children: [
        { 
          id: id + "-1", 
          color: getRandomColor(), 
          direction: null, 
          children: [] 
        },
        { 
          id: id + "-2", 
          color: getRandomColor(), 
          direction: null, 
          children: [] 
        },
      ],
    });
  };
  
  const Partition = ({ partition, isRoot = false }) => {
    const { id, color, direction, children } = partition;
    
    return (
      <div
        className={`flex ${direction === "v" ? "flex-row" : "flex-col"} h-full w-full relative`}
        style={{ backgroundColor: color }}
      >
        {children.length === 0 && (
          <div className="absolute inset-0 flex justify-center items-center gap-1">
            <button
              className="bg-white border px-2"
              onClick={() => splitPartition(id, "v")}
            >
              v
            </button>
            <button
              className="bg-white border px-2"
              onClick={() => splitPartition(id, "h")}
            >
              h
            </button>
            {!isRoot && (
              <button
                className=" bg-white border px-2"
                onClick={() => removePartition(id)}
              >
                -
              </button>
            )}
          </div>
        )}
        {children.map((child) => (
          <Partition key={child.id} partition={child} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-screen w-screen">
      {partitions.map((partition) => (
        <Partition 
          key={partition.id} 
          partition={partition} 
          isRoot={partition.id === "root"} 
        />
      ))}
    </div>
  );
};

export default App;