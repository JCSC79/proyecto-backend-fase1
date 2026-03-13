import { H1, Card, Elevation, Spinner, Callout } from "@blueprintjs/core";
import { useQuery } from "@tanstack/react-query";
import api from "./api/axiosInstance";

/**
 * Task interface to define the data structure
 */
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

function App() {
  /**
   * Fetching tasks from the backend API using TanStack Query
   */
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      // API call to our backend
      const response = await api.get("/tasks");
      return response.data;
    },
  });

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <H1>Task Manager</H1>
      <hr />

      {/* Show spinner while loading data */}
      {isLoading && <Spinner />}

      {/* Show error message if the API call fails */}
      {error && (
        <Callout intent="danger" title="Connection Error">
          Could not fetch tasks. Is the backend running?
        </Callout>
      )}

      {/* Render list of tasks using BlueprintJS Cards */}
      {tasks?.map((task) => (
        <Card key={task.id} elevation={Elevation.ONE} style={{ marginBottom: "10px" }}>
          <h5>{task.title}</h5>
          <p>{task.description}</p>
          <small>Status: <b>{task.status}</b></small>
        </Card>
      ))}

      {/* Message if no tasks are found */}
      {tasks?.length === 0 && <p>No tasks found. Everything is done!</p>}
    </div>
  );
}

export default App;