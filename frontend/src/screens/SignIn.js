import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import deviceStorage from '../services/deviceStorage';

export default class SignIn extends Component {
  state = {
    user: {
      email: '',
      password: ''
    },
    newJWT: '',
    loading: false,
    message: ''
  }

  onInputChange = (key, value) => {
    let user = {...this.state.user};
    this.setState(prevState => ({
      user: {
          ...prevState.user,
          [key]: value
      },
    }))
  }

  signIn = (e) => {
    e.preventDefault();
    this.setState({loading: true});
    fetch('http://localhost:4000/api/authenticate', {
      method: 'POST',
      body: JSON.stringify(this.state.user),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    })
    .then(res => {
      this.setState({loading: false});
      if (res.status === 200) {
        res.json().then(json => {
          deviceStorage.saveItem("jwt-token", json.token);
          this.setState({
            newJWT: json.token,
            message: json.message
          });
          this.props.newJWT(json.token);
        });
      } else if (res.status === 401) {
        res.json().then(json => {
          this.setState({
            newJWT: json.token,
            message: json.message
          });
        });
      } else {
        const error = new Error(res.error);
        throw error;
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error logging in please try again');
    });
  }

  render() {
    return (
      <View>
        <Text>Login Below!</Text>
        <Input
            placeholder="Email"
            type='email'
            name='email'
            onChangeText={this.onInputChange}
            value={this.state.user.email}
          />
        <Input
            placeholder="Password"
            type='password'
            name='password'
            onChangeText={this.onInputChange}
            value={this.state.user.password}
            secureTextEntry
          />
        <Button
          isLoading = {this.state.loading}
          title='Sign In'
          onPress={this.signIn.bind(this)}
          />
        <Text> {this.state.message} </Text>
      </View>
    );
  }
}
