import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown, Container, Button, Table } from "react-bootstrap";
import Axios from "axios";
import { truncate } from 'fs';

export interface ITabProps {

}
interface ITabState {
  user: string;
  inputUserName: string;
  showCourse: boolean;
  showSubject: boolean;
  showStudents: boolean;
  showMarks: boolean;
  showMark: boolean;
  courses: any[];
  subjects: any[];
  marks: any[];
  students: any[];
  uid: number;
  error: boolean;
}
class App extends React.Component<ITabProps, ITabState> {
  constructor(props: ITabProps) {
    super(props)
    this.state = {
      user: "",
      inputUserName: "",
      showCourse: true,
      showSubject: false,
      showStudents: false,
      showMarks: false,
      showMark: false,
      courses: [],
      subjects: [],
      marks: [],
      students: [],
      uid: 0,
      error: false
    }

    //Bind any functions that need to be passed as callbacks or used to React components
    this.handleInputUserNameChange = this.handleInputUserNameChange.bind(this);
    this.onClickLogin = this.onClickLogin.bind(this);
  }


  componentDidMount() {
    //initial check for saved user
    if (localStorage.getItem('user') != null) {
      this.setState({ user: localStorage.getItem('user')! })
      var id = 0;
      if (localStorage.getItem('user') == "admin") {
        this.setState({ uid: 1 })
        id = 1;
      } else if (localStorage.getItem('user') == "profesor") {
        this.setState({ uid: 2 })
        id = 2;
      } else {
        this.setState({ uid: 3 })
        id = 3;
      }
      this.getCourses(id);
      console.log("usuario")
      console.log("USUARIO "+this.state.user)
    }

  }

  //data base methods
  getCourses(id: number) {
    Axios.get("http://localhost:3001/api/get/courses", {
      params: {
        user: id
      }
    }).then((result) => {
      this.setState({ courses: result.data })
      this.setState({ showSubject: false })
      this.setState({ showCourse: true })
      this.setState({ showStudents: false })
      this.setState({ showMarks: false })
    }).catch((error) => {
      this.setState({ error: true });
    });
    console.log(this.state.uid)

  }
  getSubjects(year: number) {
    Axios.get("http://localhost:3001/api/get/subjects", {
      params: {
        user: this.state.uid,
        year: year
      }
    }).then((result) => {
      this.setState({ subjects: result.data })
      console.log(result.data)
      this.setState({ showSubject: true })
      this.setState({ showCourse: false })

      this.setState({ showStudents: false })
      this.setState({ showMarks: false })
    }).catch((error) => {
      this.setState({ error: true });
    });
    console.log(this.state.uid)

  }

  getStudents(id: number) {
    console.log(id)
    Axios.get("http://localhost:3001/api/get/students/subject", {
      params: {
        subject: id
      }
    }).then((result) => {
      this.setState({ students: result.data })
      console.log(result.data)
      this.setState({ showSubject: false })
      this.setState({ showCourse: false })
      this.setState({ showStudents: true })
      this.setState({ showMarks: false })
    }).catch((error) => {
      this.setState({ error: true });
    });

  }
  getMarks(id: number, subject: number) {


    Axios.get("http://localhost:3001/api/get/marks", {
      params: {
        subject: subject,
        user: id
      }
    }).then((result) => {
      this.setState({ marks: result.data })
      console.log(result.data)
      this.setState({ showSubject: false })
      this.setState({ showCourse: false })
      this.setState({ showStudents: false })
      this.setState({ showMarks: true })
    }).catch((error) => {
      this.setState({ error: true });
    });
  }

  //Interface methods
  onClickLogin() {
    console.log(this.state.inputUserName);
    if (this.state.inputUserName == "admin" || this.state.inputUserName == "profesor" || this.state.inputUserName == "alumno") {
      localStorage.setItem('user', this.state.inputUserName);
      this.setState({ user: this.state.inputUserName });
      var id = 0
      if (this.state.inputUserName == "admin") {
        this.setState({ uid: 1 })
        id = 1
      } else if (this.state.inputUserName == "profesor") {
        this.setState({ uid: 2 })
        id = 2
      } else {
        this.setState({ uid: 3 })
        id = 3
      }
      this.getCourses(id);
    }
  }
  onClickLogout() {
    localStorage.removeItem('user');
    window.location.reload();
  }
  onClickSubjects(year: number) {
    this.getSubjects(year)

  }

  onClickStudents(id: number, subject: number) {

    if (this.state.uid == 2) {
      this.getStudents(subject)
    } else {
      this.getMarks(id, subject)
    }

  }

  handleInputUserNameChange(event: any) {
    this.setState({ inputUserName: event.target.value });
  }

  render() {
    //Login form
    let loginPage = this.state.user == null || !this.state.user ?
      <div id="div_login">
        <h1>Inicio de sesion</h1>
        <form>
          <label>
            <p>Usuario</p>
            <input type="text" value={this.state.inputUserName} onChange={this.handleInputUserNameChange} />
          </label>
          <label>
            <p>Contraseña</p>
            <input type="password" />
          </label>
          <div>
            <Button className="btn_input" onClick={this.onClickLogin}>Aceptar</Button>
          </div>
        </form>
      </div> : null;

    let header = this.state.user == null || !this.state.user ? null :
      <header>
        <div id="header_left"></div>
        <div id="header_center"><h1>MyClass</h1></div>
        <div id="header_right">
          <Navbar expand="md">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link onClick={() => { this.getCourses(this.state.uid) }}>Cursos</Nav.Link>
                <Nav.Link onClick={() => { this.onClickSubjects(0) }}>Asignaturas</Nav.Link>
                <Button onClick={this.onClickLogout}>Cerrar sesion</Button>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </header>

    let tableCourse = this.state.user == null || !this.state.user || !this.state.showCourse ? null :
      <Table striped bordered hover className={this.state.courses.length == 0 ? "hide" : ""}>
        <thead>
          <tr>
            <th>Curso</th>
          </tr>
        </thead>
        <tbody>
          {this.state.courses.map((c: any) => {
            return (
              <tr key={c.id}>
                <td className="pt-4" onClick={() => { this.onClickSubjects(c.year) }}>{c.year}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

    let tableSubject = this.state.user == null || !this.state.user || !this.state.showSubject ? null :
      <React.Fragment>
        <p onClick={() => { this.setState({ showSubject: false }); this.setState({ showCourse: true }) }}>Atras</p>
        <Table striped bordered hover className={this.state.subjects.length == 0 ? "hide" : ""}>
          <thead>
            <tr>
              <th>Asignaturas </th>

              <th>Profesor</th>

              
              <th>Año</th>
            </tr>
          </thead>
          <tbody>
            {this.state.subjects.map((s: any) => {
              return (
                <tr key={s.id} onClick={() => { this.onClickStudents(this.state.uid, s.id) }}>
                  <td className="pt-4" >{s.name}</td>
                  <td className="pt-4" >{s.teacher}</td>
                  <td className="pt-4" >{s.year}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </React.Fragment>
    let tableStudents = this.state.user == null || !this.state.user || !this.state.showStudents ? null :
      <React.Fragment>
        <p onClick={() => { this.setState({ showStudents: false }); this.setState({ showSubject: true }) }}>Atras</p>
        <Table striped bordered hover className={this.state.students.length == 0 ? "hide" : ""}>
          <thead>
            <tr>
              <th>Estudiantes </th>
            </tr>
          </thead>
          <tbody>
            {this.state.students.map((s: any) => {
              return (
                <tr key={s.id}>
                  <td className="pt-4" onClick={() => { this.getMarks(s.id, s.subject) }}>{s.username}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </React.Fragment>
    let tableMarks = this.state.user == null || !this.state.user || !this.state.showMarks ? null :
      <React.Fragment>
        <p onClick={() => { this.setState({ showMarks: false }); if (this.state.uid == 2) { this.setState({ showStudents: true }) } else { this.setState({ showSubject: true }) } }}>Atras</p>
        <Table striped bordered hover className={this.state.marks.length == 0 ? "hide" : ""}>
          <thead>
            <tr>
              <th>Notas </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.marks.map((s: any) => {
              return (
                <tr key={s.id}>
                  <td className={s.grade > 5 ? "pt-4 bg-success" : "pt-4 bg-danger"}>{s.grade}</td>

                  <td className="pt-4">{s.description}</td>

                </tr>
              );
            })}
          </tbody>
        </Table>
      </React.Fragment>

    let noResult = (((this.state.showCourse && this.state.courses.length == 0) || (this.state.showStudents && this.state.students.length == 0) || (this.state.showMarks && this.state.marks.length == 0) || (this.state.showSubject && this.state.subjects.length == 0)) && this.state.user != "") ?
      <div id="div_no_result" onClick={()=>{console.log(this.state.user)}}> <h2>No hay resultados</h2></div>
      : null

    return (
      <div>
        {header}
        {loginPage}
        {tableCourse}
        {tableSubject}
        {tableStudents}
        {tableMarks}
        {noResult}
      </div>
    );
  }
}
export default App;