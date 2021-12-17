import React, { Component } from "react";
import classnames from "classnames";
import Loading from "./Loading";
import Panel from "./Panel";
import axios from "axios";

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
} from "helpers/selectors";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

// using named imports, else use 'extends React.Component'
class Dashboard extends Component {

  // class property syntax, ES6
  selectPanel(id) {
    // using function to set state to prevent stale state
    this.setState(previousState => ({
      // set the value of focused back to null if the value of focused is currently set to a panel
      focused: previousState.focused !== null ? null : id
    }));
  }

  state = {
    loading: true,
    focused: null,
    // represent the initial state with the correct data types, even though they are initially empty
    days: [],
    appointments: {},
    interviewers: {}
  }

  // on first render
  componentDidMount() {
    // check if focused from local storage in browser
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }

    // merge into existing state object
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });

    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

  }

  // on subsequent renders
  // listens for changes in the state
  // same as useEffect hook
  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  render() {
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
    });
    
    if (this.state.loading) {
      return <Loading />;
    }

    const panels = data
      .filter(
        panel => this.state.focused === null || this.state.focused === panel.id
      )
      .map(panel => (
        <Panel
          key={panel.id}
          id={panel.id}
          label={panel.label}
            // look up the value in the state
          value={panel.getValue(this.state)}
            // use arrow function in the render method to bind 'this'
            // create function once, here
          onSelect={event => this.selectPanel(panel.id)}
        />
      ))
    
    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;