// Some imports
import React from 'react';
import { Text, StyleSheet, Linking, ScrollView,View, ActivityIndicator, RefreshControl } from 'react-native';
import { Constants } from 'expo';
import { List, ListItem, Button } from 'react-native-elements'; // 0.19.0
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from "apollo-link";
import { HttpLink,createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { ApolloProvider, graphql } from 'react-apollo';

import "@expo/vector-icons"; // 6.2.2
import "redux"; // 3.7.2
import "prop-types"; // Supported builtin module
// Apollo Client lets you attach GraphQL queries to
// your UI components to easily load data
    
const FeedWithData = graphql(gql `{
search(term: "chicken",
         location: "brixton") {
    business {
      name
      id
      is_claimed
      is_closed
       hours {
      is_open_now
      open {
          is_overnight
          end
          start
          day
        }
      }
      display_phone
      review_count
      rating
      photos
    }
  }
}`, { options: { notifyOnNetworkStatusChange: true } })(Feed);

export default class App extends React.Component {
  
  createClient() {
    
    const httpLink = createHttpLink({ uri: 'https://api.yelp.com/v3/graphql' });
    const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = 'wPtAOS32ol-iD5WY3MiiXNiQFEYUDa87tY7mWUi2MJkFssBX5jqWY30KPyCqZFiEAPTHlqWLdVGRwwD2vhwT6KpYunCQ0FEIOESieauNWrmPpeE0NVZsyWlbkjidWnYx';
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        'Accept-Language': 'en_US'
      }
    }
  });

    // const link = middlewareLink.concat(httpLink);
    
    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  }

  render() {
    return (
      // Feed the client instance into your React component tree
      <ApolloProvider client={this.createClient()}>
        <FeedWithData />
      </ApolloProvider>
    );
  }
}

// The data prop here comes from the Apollo HoC. It has the data
// we asked for, and also useful methods like refetch().
function Feed({ data }) {
  console.log("DATA==",data)
  return (
      <ScrollView style={styles.container} 
        refreshControl={
          // This enables the pull-to-refresh functionality
          <RefreshControl
            refreshing={data.networkStatus === 4}
            onRefresh={data.refetch}/>
        } >
        <Text style={styles.title}>GitHunt</Text> 
        <FeedList data = { data }/>   
      </ScrollView>
);
}

function FeedList({ data }) {
  if (data.networkStatus === 1) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (data.error) {
    return <Text>Error! {data.error.message}</Text>;
  }

  return (
    <List containerStyle={styles.list}>
      { data.search.business.map((item) => {
          // const badge = item.rating && {
          //   value: `☆ ${item.rating}`,
          //   badgeContainerStyle: { right: 10, backgroundColor: '#56579B' },
          //   badgeTextStyle: { fontSize: 12 },
          // };
              
        
          return <ListItem
            hideChevron
            key={`${item.id}`}
            title={`${item.name}`}
            // subtitle={`Posted by ${item.review_count}`}
            // badge={badge}
          />;
        }
      ) }
    </List>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    margin: 20,
    marginBottom: 0
  },
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  learnMore: {
    margin: 20,
    marginTop: 0
  },
  loading: {
    margin: 50
  },
  list: {
    marginBottom: 20
  },
  fullApp: {
    marginBottom: 20,
    textAlign: 'center'
  }
});

function goToApolloWebsite() {
  Linking.openURL('http://dev.apollodata.com').catch((e) => console.log(e));
}
