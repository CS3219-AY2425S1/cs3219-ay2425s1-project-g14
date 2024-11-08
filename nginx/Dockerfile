FROM nginx:alpine 
COPY nginx.conf /etc/nginx/internal.conf
EXPOSE 70
CMD ["nginx", "-c", "internal.conf", "-g", "daemon off;"]