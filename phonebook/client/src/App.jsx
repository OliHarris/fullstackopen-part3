import { useState, useEffect } from "react";
import personService from "./services/persons";

// a proper place to define a component
const Notification = ({ messageType, message }) => {
  if (message === null) {
    return null;
  }

  return (
    <>
      {messageType === "success" && <div className="success">{message}</div>}
      {messageType === "error" && <div className="error">{message}</div>}
    </>
  );
};

const Filter = ({ newFilter, setNewFilter }) => {
  return (
    <div>
      filter shown with{" "}
      <input
        value={newFilter}
        onChange={(event) => setNewFilter(event.target.value)}
      />
    </div>
  );
};

const showMessage = (setMessageType, type, setMessage, messageString) => {
  setMessageType(type);
  setMessage(messageString);
  setTimeout(() => {
    setMessage(null);
  }, 5000);
};

const PersonForm = ({
  newName,
  persons,
  newNumber,
  setPersons,
  setNewFilter,
  setNewName,
  setNewNumber,
  setMessageType,
  setMessage,
}) => {
  const addPerson = (event) => {
    event.preventDefault();

    if (newName) {
      const isInArray = persons.some((item) => item.name === newName);
      if (!isInArray) {
        const personObject = {
          name: newName,
          number: newNumber,
        };

        personService
          .create(personObject)
          .then((returnedPerson) => {
            // concat will add to copied state (no mutate)
            setPersons(persons.concat(returnedPerson));
            setNewFilter("");
            setNewName("");
            setNewNumber("");
            showMessage(
              setMessageType,
              "success",
              setMessage,
              `Added '${newName}'`
            );
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        if (
          window.confirm(
            `${newName} is already added to phonebook, replace the old number with a new one?`
          )
        ) {
          const person = persons.find((item) => item.name === newName);
          // copy object because of reference to array state (no mutate)
          const changedPerson = { ...person, number: newNumber };

          personService
            .update(person.id, changedPerson)
            .then(() => {
              setPersons(
                persons.map((item) =>
                  item.id === person.id ? changedPerson : item
                )
              );
              showMessage(
                setMessageType,
                "success",
                setMessage,
                `Changed '${newName}'`
              );
            })
            .catch(() => {
              showMessage(
                setMessageType,
                "error",
                setMessage,
                `Information of '${newName}' has already been removed from server`
              );
            });
        }
      }
    }
  };

  return (
    <form onSubmit={addPerson}>
      <div>
        name:{" "}
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
      </div>
      <div>
        number:{" "}
        <input
          value={newNumber}
          onChange={(event) => setNewNumber(event.target.value)}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Persons = ({
  setPersons,
  persons,
  newFilter,
  setMessageType,
  setMessage,
}) => {
  const deletePerson = (id) => {
    const person = persons.find((item) => item.id === id);
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .deleteMe(id)
        .then(() => {
          setPersons(persons.filter((item) => item.id !== id));
        })
        .catch(() => {
          showMessage(
            setMessageType,
            "error",
            setMessage,
            `Information of '${person.name}' has already been removed from server`
          );
        });
    }
  };

  return (
    <ul>
      {persons
        .filter((item) =>
          item.name.toLowerCase().includes(newFilter.toLowerCase())
        )
        .map((person) => (
          <li key={person.name}>
            {person.name} {person.number}{" "}
            <button onClick={() => deletePerson(person.id)}>delete</button>
          </li>
        ))}
    </ul>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newFilter, setNewFilter] = useState("");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    personService
      .getAll()
      .then((initialPersons) => {
        setPersons(initialPersons);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <h2>Phonebook</h2>
      {/* extract out props; send down from top level */}
      <Notification messageType={messageType} message={message} />
      {/* extract out props; send down from top level */}
      <Filter newFilter={newFilter} setNewFilter={setNewFilter} />
      <h3>add a new</h3>
      {/* extract out props; send down from top level */}
      <PersonForm
        newName={newName}
        persons={persons}
        newNumber={newNumber}
        setPersons={setPersons}
        setNewFilter={setNewFilter}
        setNewName={setNewName}
        setNewNumber={setNewNumber}
        setMessageType={setMessageType}
        setMessage={setMessage}
      />
      <h3>Numbers</h3>
      {/* extract out props; send down from top level */}
      <Persons
        setPersons={setPersons}
        persons={persons}
        newFilter={newFilter}
        setMessageType={setMessageType}
        setMessage={setMessage}
      />
    </div>
  );
};

export default App;
