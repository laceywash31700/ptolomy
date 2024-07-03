import axios from 'axios';
import ReactPlayer from 'react-player';
import {useEffect, useState }from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';


function MapViewer({type, src}) {
  return (
    <Paper elevation={2} style={{width: '100%', height:'100vh', padding: '16px' }}>
        <Typography variant='h5' component="div" gutterBottom>
            Map Viewer
        </Typography>
        {type === 'image' ? (
            <TransformWrapper>
                <TransformComponent>
                    <Box 
                    component={'img'}
                    src={src}
                    alt="Map"
                    sx={{width:'100%', height: 'auto'}}
                    />
                </TransformComponent>
            </TransformWrapper>
        ) : (
            <ReactPlayer
            url={src}
            controls={true}
            width='100%'
            height='100%'
            />
        )}
    </Paper>
  )
}

export default MapViewer