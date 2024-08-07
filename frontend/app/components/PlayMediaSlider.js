import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { formatTime } from '../utils/AudioUtils';

const PlayMediaSlider = ({
  sound,
  duration,
  isPlaying,
  setIsPlaying,
  autoNextTrack,
}) => {
  const [position, setPosition] = useState(0);

  const handleSliderChange = (value) => {
    if (sound) {
      const newPositionMillis = value * 1000;
      sound.setPositionAsync(newPositionMillis);
      setPosition(value);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        console.log('Unloading Sound');
        setIsPlaying(false);
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (sound && isPlaying) {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (
          typeof status.positionMillis === 'number' &&
          !isNaN(status.positionMillis)
        ) {
          setPosition(status.positionMillis / 1000);
          if (status.positionMillis / 1000 >= duration && autoNextTrack) {
            setIsPlaying(false);
            autoNextTrack();
          }
        }
      });
    }
  }, [sound, isPlaying]);

  return (
    <>
      <View style={styles.playmediaCenter}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={handleSliderChange}
          thumbTintColor="#137882"
          minimumTrackTintColor="#009688"
          maximumTrackTintColor="#000000"
        />
        <View style={styles.progressLevelDuration}>
          <Text style={styles.progressLabelText}>{formatTime(position)}</Text>
          <Text style={styles.progressLabelText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </>
  );
};

export default PlayMediaSlider;

const styles = StyleSheet.create({
  playmediaCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    paddingHorizontal: 12,
  },
  progressBar: {
    width: '100%',
  },
  progressLevelDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  progressLabelText: {},
});
