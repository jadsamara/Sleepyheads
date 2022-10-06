import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { Card } from "./Card";
import { BABYFEATURESDATA } from "./BabyFeaturesData";

export const CardList = ({ goToPage }) => {
  return (
    <FlatList
      data={BABYFEATURESDATA}
      showsVerticalScrollIndicator={false}
      maxToRenderPerBatch={2}
      initialNumToRender={2}
      numColumns={2}
      scrollEnabled={false}
      renderItem={({ item }) => {
        return (
          <ItemButton onPress={() => goToPage(item.title)}>
            <Card card={item} />
          </ItemButton>
        );
      }}
      keyExtractor={(item) => item.id}
    />
  );
};

const ItemButton = styled(TouchableOpacity)`
  margin-top: 5%;
`;
