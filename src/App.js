import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  // Create a new moveable component and add it to the array
  const addMoveable = () => {
    // Random number from 1 to 5000 (API contains 5000 photos)
    let randomImageIndex = Math.ceil(Math.random() * 5000)

    // API call
    fetch(`https://jsonplaceholder.typicode.com/photos/${randomImageIndex}`)
      .then(res => res.json())
      .then(selectedPhoto => {
        // Add the new movable component to the array
        setMoveableComponents([
          ...moveableComponents,
          {
            id: Math.floor(Math.random() * Date.now()), //"Unique" ID
            top: 0, // top, left, width and height working together to set the new component at the beginning of the parent with 100px size
            left: 0,
            width: 100,
            height: 100,
            image: selectedPhoto.thumbnailUrl, // URL given by the API
            fit: Math.ceil(Math.random() * 5) // To set a random fit style
          },
        ]);
      })
  };

  // Delete the selected moveable component and remove it from the array
  const deleteMoveable = () => {
    // Filter the selected component from the hole array
    const nonDeletedComponents = moveableComponents.filter(component => {
      // If non of the components are selected, then nothing happened
      if(selected === null){
        return true;
      }
      // If the component is not selected, keep it
      if(component.id !== selected){
        return true;
      }
      // If the component is selected, delete it
      return false;
    });
    // Update the array
    setMoveableComponents(nonDeletedComponents);
  }

  // Update a component top and left values when it's been moved
  const updateMoveable = (id, newComponent) => {
    // Look for the component if interest
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      // Validate if it is the right component and update it
      if (moveable.id === id) {
        return { id, ...newComponent };
      }
      // If it is not the correct component, do not touch it
      return moveable;
    });
    // Update components array
    setMoveableComponents(updatedMoveables);
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={deleteMoveable}>Delete Selected Moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

// Keep window size in a variable as they are needed to some calculations
function getWindowSize() {
  const {innerWidth, innerHeight} = window;
  return {innerWidth, innerHeight};
}

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  image,
  id,
  setSelected,
  isSelected = false,
  fit
}) => {
  const ref = useRef();

  const [windowSize, setWindowSize] = useState(getWindowSize());
  const [frame] = useState({ translate: [0,0] });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  // Update window size
  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Moveable function at the beginning of the "resize moment"
  const onResizeStart = e => {
    e.setOrigin(["%", "%"]);
    e.dragStart && e.dragStart.set(frame.translate);
  }

  // Moveable function while the "resize moment" is happening
  const onResize = e => {
    const beforeTranslate = e.drag.beforeTranslate;

    // Update moveable component dimensions
    frame.translate = beforeTranslate;
    e.target.style.width = `${e.width}px`;
    e.target.style.height = `${e.height}px`;
    e.target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
  }

  return (
    <>
      <img
        ref={ref}
        src={image}
        alt={"component"+id}
        className={`draggable obj-fit-${fit}`}
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        snappable={true}
        resizable
        draggable
        bounds={{"left":0,"top":0,"right":windowSize.innerWidth*0.8,"bottom":windowSize.innerHeight*0.8}}
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            image,
            fit
          });
        }}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        onResizeStart={onResizeStart}
        onResize={onResize}
        verticalGuidelines={[parentBounds.width*0.25,parentBounds.width*0.50,parentBounds.width*0.75]}
        horizontalGuidelines={[parentBounds.height*0.25,parentBounds.height*0.50,parentBounds.height*0.75]}
        snapThreshold={5}
        isDisplaySnapDigit={true}
        snapGap={true}
        snapDirections={{"top":true,"right":true,"bottom":true,"left":true}}
        snapDigit={2}
      />
    </>
  );
};
